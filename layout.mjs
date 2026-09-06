/**
 * Grid layout rules, shared by make_projects.mjs and make_media.mjs.
 *
 * It lives in one place because the two scripts must agree: the generator
 * decides whether a project renders as a small or large tile, and the media
 * pipeline has to cut that project's thumbnail to the matching aspect ratio.
 * If these ever disagree, every thumbnail gets double-cropped by object-fit.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

/** Tile sizes map to .tile--sm / .tile--lg in css/site.css (lines 473-474). */
export const RATIOS = {
  sm: { w: 4, h: 3 },   // .tile--sm .tile__frame { aspect-ratio: 4 / 3 }
  lg: { w: 5, h: 4 },   // .tile--lg .tile__frame { aspect-ratio: 5 / 4 }
};

export function load() {
  const data = JSON.parse(readFileSync(join(ROOT, "projects.json"), "utf8"));
  return {
    studios: data.studios,
    published: data.projects.filter((p) => p.published),
    all: data.projects,
  };
}

/**
 * Group published projects into asymmetric pairs.
 *
 * Pairs are studio-pure, which main introduced deliberately: the filter hides
 * a whole .pair at once, so a mixed pair would leave an orphaned half whenever
 * a discipline is filtered out. A studio with an odd count therefore ends on a
 * solo full-width tile rather than borrowing a partner from the next studio.
 *
 * Size alternates sm/lg and flips each pair, so the heavy tile zig-zags down
 * the page instead of stacking in one column.
 */
export function pairs(published) {
  const runs = [];
  for (const p of published) {
    const last = runs.at(-1);
    if (last && last[0].studio === p.studio) last.push(p);
    else runs.push([p]);
  }

  const out = [];
  let flip = false;
  for (const run of runs) {
    for (let i = 0; i < run.length; i += 2) {
      if (i + 1 < run.length) {
        const sizes = flip ? ["lg", "sm"] : ["sm", "lg"];
        out.push({
          flip,
          solo: false,
          items: [
            { project: run[i], size: sizes[0], delay: 0 },
            { project: run[i + 1], size: sizes[1], delay: 80 },
          ],
        });
        flip = !flip;
      } else {
        out.push({
          flip: false,
          solo: true,
          items: [{ project: run[i], size: "lg", delay: 0 }],
        });
      }
    }
  }
  return out;
}

/** slug -> "sm" | "lg", so make_media.mjs can cut to the right ratio. */
export function tileSizes(published) {
  const map = {};
  for (const row of pairs(published))
    for (const { project, size } of row.items) map[project.slug] = size;
  return map;
}
