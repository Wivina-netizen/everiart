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

/**
 * The home page shows a fixed-size teaser, not the whole catalogue: the first
 * `perStudio` projects of each studio, in projects.json order, followed by the
 * "See all work" call to action.
 *
 * This is a cap, not a coincidence. With six projects the teaser happens to be
 * everything; at twenty it must still be two per studio, or the home page grows
 * without bound and the CTA stops meaning anything.
 */
export function teaser(published, perStudio = 2) {
  const count = {};
  return published.filter((p) => {
    count[p.studio] = (count[p.studio] ?? 0) + 1;
    return count[p.studio] <= perStudio;
  });
}

/**
 * slug -> "sm" | "lg", so make_media.mjs can cut thumbnails to the ratio the
 * tile will actually render at.
 *
 * Derived from the /work/ grid, not the home teaser. Both surfaces render
 * tiles now, but /work/ is the one that renders EVERY published project, so
 * it is the only grid that has an opinion about every slug. Sizing off the
 * teaser would leave anything past the cap defaulting to 4:3 while /work/
 * rendered it at 5:4.
 *
 * The two grids can still disagree about a project that appears in both: they
 * pair over different-length runs, so the same project can land on the small
 * side of one and the large side of the other. That is a ~6% extra crop by
 * object-fit on the home page, not a broken tile — 4:3 and 5:4 are close
 * enough that one cut serves both. It cannot be fixed by choosing the other
 * grid, only by cutting two thumbnails per project, which is not worth it.
 *
 * @param perStudio kept for callers that still reason about the teaser cap.
 */
export function tileSizes(published, perStudio = 2) {
  const map = {};
  for (const row of pairs(published))
    for (const { project, size } of row.items) map[project.slug] = size;
  for (const p of published) map[p.slug] ??= "sm";
  return map;
}
