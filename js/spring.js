/* ============================================================
   EVERIART — Spring engine
   Implements apple-design §3/§4/§5:
   - animates from the PRESENTATION (current) value, never the target
   - interruptible at any instant; re-target carries velocity through
   - damping ratio + response (not mass/stiffness/damping)
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * A single-axis spring. Decompose 2D motion into two of these
 * (apple-design §3: one spring on a 2D distance desyncs).
 */
export class Spring {
  /**
   * @param {number} value    initial value
   * @param {object} opts     { damping, response, onUpdate, onRest }
   */
  constructor(value = 0, opts = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.damping = opts.damping ?? 1.0;    // 1.0 = critically damped
    this.response = opts.response ?? 0.36; // seconds to reach target
    this.onUpdate = opts.onUpdate || null;
    this.onRest = opts.onRest || null;
    this._raf = null;
    this._last = 0;
    this._restEps = opts.restEps ?? 0.0015;
  }

  /**
   * Re-target. Critically: does NOT reset value or velocity.
   * This is what makes an interrupt continuous instead of a jump,
   * and what avoids the reversal "brick wall" (apple-design §3).
   */
  setTarget(target, opts = {}) {
    this.target = target;
    if (opts.damping !== undefined) this.damping = opts.damping;
    if (opts.response !== undefined) this.response = opts.response;
    this._start();
  }

  /** Hand off a gesture's release velocity into the spring (apple-design §5). */
  setVelocity(v) {
    this.velocity = v;
    this._start();
  }

  /** Hard-set with no animation — used for 1:1 drag tracking. */
  set(value) {
    this._stop();
    this.value = value;
    this.velocity = 0;
    if (this.onUpdate) this.onUpdate(this.value, this);
  }

  _start() {
    if (this._raf !== null) return; // already running; loop reads new target
    this._last = performance.now();
    const tick = (now) => {
      // Clamp dt so a backgrounded tab doesn't explode the integration
      const dt = Math.min((now - this._last) / 1000, 1 / 30);
      this._last = now;

      // Convert (damping ratio, response) -> (omega, zeta)
      const omega = (2 * Math.PI) / this.response;
      const zeta = this.damping;

      // Semi-implicit Euler: stable and cheap
      const x = this.value - this.target;
      const accel = -(omega * omega * x) - (2 * zeta * omega * this.velocity);
      this.velocity += accel * dt;
      this.value += this.velocity * dt;

      if (this.onUpdate) this.onUpdate(this.value, this);

      const settled =
        Math.abs(this.value - this.target) < this._restEps &&
        Math.abs(this.velocity) < this._restEps;

      if (settled) {
        this.value = this.target;
        this.velocity = 0;
        if (this.onUpdate) this.onUpdate(this.value, this);
        this._raf = null;
        if (this.onRest) this.onRest(this);
        return;
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _stop() {
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  destroy() { this._stop(); }
}

/**
 * Velocity tracker — keeps a short position/time history so we can
 * hand real gesture velocity to a spring on release (apple-design §2/§5).
 */
export class VelocityTracker {
  constructor(historyMs = 100) {
    this.historyMs = historyMs;
    this.samples = [];
  }
  add(value) {
    const now = performance.now();
    this.samples.push({ value, t: now });
    while (this.samples.length > 2 && now - this.samples[0].t > this.historyMs) {
      this.samples.shift();
    }
  }
  /** @returns {number} units per second */
  velocity() {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return 0;
    return (last.value - first.value) / dt;
  }
  reset() { this.samples.length = 0; }
}

/**
 * Project where a flick would naturally land (apple-design quick-ref):
 *   current + (v/1000) * d / (1 - d)
 */
export function projectMomentum(current, velocity, decay = 0.998) {
  return current + (velocity / 1000) * (decay / (1 - decay));
}

/** Progressive resistance at a boundary — never hard-stop (apple-design). */
export function rubberBand(offset, dimension, constant = 0.55) {
  if (dimension === 0) return 0;
  return (1 - 1 / ((offset * constant) / dimension + 1)) * dimension;
}

export const prefersReducedMotion = () => REDUCED.matches;
export { REDUCED };
