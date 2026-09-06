/**
 * Derive web-ready assets/ media from the untouched originals in 'media source/'.
 *
 * Read-only with respect to 'media source/' — nothing there is renamed, moved or
 * rewritten. Every output is a new file under assets/<slug>/.
 *
 *   thumb.jpg       1200x1500 (4:5, matches .card__frame in css/site.css:251)
 *   gallery-NN.jpg  long edge capped at 1600
 *   reel.mp4        H.264 / AAC, capped at 1920, +faststart
 *   clip-NN.mp4     supplementary videos, same encode
 *
 * Thumbnail fit differs by source type, because they fail differently at 4:5:
 *   "crop"     photographs and video frames — centre-crop to fill.
 *   "contain"  design boards — whole board on its own brand ground; cropping a
 *              brand board slices the logo in half.
 *
 *   node make_media.mjs [slug ...]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { basename, dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "media source");
const OUT = join(ROOT, "assets");

const THUMB_W = 1200;
const THUMB_H = 1500;
const GALLERY_MAX = 1600;
const VIDEO_MAX = 1920;

// ------------------------------------------------------------- source map
// ["path"]          -> a still on disk
// ["path", 12]      -> the frame 12s into that video
const BE = "beFrames";
const BY = "byEveriart";
const ED = "everiDesign";

const H4H = `${BY}/Documenataries/Hope for Her`;
const RPUE = `${BY}/Regalia Pop Up Events`;
const AGRA_V = `${BY}/Documenataries/AGRA`;
const BMT = `${ED}/BMT Apparel/BMT BRANDING FILES`;
const MT = `${ED}/Maitro Tech/Maitro Tech`;

const WLR = `${RPUE}/WLR- RPUE 01.mov`;
const APR26 = `${RPUE}/RPUE- APR 26- THE JINGLE AD.mov`;
const APR13 = `${RPUE}/RPUE APR 13TH EDTION JINGLE II.mov`;
const AZ_HD = `${BY}/Real Estate/Azusa/AZUSA HOTEL AND APARTMENT HD 02.mov`;

const PROJECTS = {
  "hope-for-her": {
    fit: "crop",
    thumb: ["Thumbs/thumb2.png"],
    gallery: [["Thumbs/thumb2.png"], ["Thumbs/thumb.png"], ["Thumbs/thumb3.png"]],
    reel: `${H4H}/Spoken Words- H4H.mov`,
    clips: [],
  },
  "regalia-pop-up-events": {
    fit: "crop",
    thumb: [WLR, 8],
    gallery: [
      [WLR, 8], [WLR, 5], [WLR, 2], [WLR, 14], [WLR, 17],
      [APR26, 40], [APR13, 40],
    ],
    reel: WLR,
    clips: [APR26, APR13],
  },
  "maitro-tech": {
    fit: "contain",
    ground: "0xFCFCFC",
    thumb: [`${MT}/MT1@500x-100.jpg`],
    gallery: [[`${MT}/MT1@500x-100.jpg`], [`${MT}/Maitro Concept 1@500x-100.jpg`]],
    reel: null,
    clips: [],
  },
  "bmt-apparels": {
    fit: "contain",
    ground: "0x0B1612",
    thumb: [`${BMT}/500ppi/Artboard 1 copy 5@500x-100.jpg`],
    gallery: [
      [`${BMT}/500ppi/Artboard 1 copy 5@500x-100.jpg`],
      [`${BMT}/500ppi/Artboard 1 copy 4@500x-100.jpg`],
      [`${BMT}/500ppi/Artboard 1 copy 3.jpg`],
      // The six moodboard pages below were removed from 'media source/' on
      // 2026-09-06, mid-build, by something outside this script — it only ever
      // reads from there. Restore the files and un-comment to get them back.
      //   [`${BMT}/BMT MoodboardiArtboard 4.jpg`],   // swatches
      //   [`${BMT}/BMT MoodboardiArtboard 6.jpg`],   // typography refs
      //   [`${BMT}/BMT MoodboardiArtboard 8.jpg`],   // iconography I
      //   [`${BMT}/BMT MoodboardiArtboard 9.jpg`],   // iconography II
      //   [`${BMT}/BMT MoodboardiArtboard 11.jpg`],  // textures
      //   [`${BMT}/BMT MoodboardiArtboard 15.jpg`],  // photography
      // (Artboard 13, the black/gold Colours page, stays excluded regardless —
      //  it documents the rejected direction's palette.)
    ],
    reel: null,
    clips: [],
  },
  agra: {
    fit: "crop",
    thumb: [`${BE}/AGRA/DSC08292.jpg`],
    gallery: [
      [`${BE}/AGRA/DSC08151.jpg`], [`${BE}/AGRA/DSC08157.jpg`],
      [`${BE}/AGRA/DSC08273.jpg`], [`${BE}/AGRA/DSC08219.jpg`],
      [`${BE}/AGRA/DSC08292.jpg`], [`${BE}/AGRA/DSC08365.jpg`],
      [`${BE}/AGRA/DSC08451.jpg`], [`${BE}/AGRA/DSC08498.jpg`],
      [`${BE}/AGRA/DSC08431.jpg`], [`${BE}/AGRA/DSC08435.jpg`],
    ],
    reel: `${AGRA_V}/AGRA 2026 SQUARE II.mov`,
    clips: [],
  },
  azusa: {
    fit: "crop",
    thumb: [AZ_HD, 155],
    gallery: [
      [AZ_HD, 155], [AZ_HD, 8], [AZ_HD, 35], [AZ_HD, 80],
      [AZ_HD, 110], [AZ_HD, 125], [AZ_HD, 170],
    ],
    reel: AZ_HD,
    clips: [],
  },
};

const ff = (args) =>
  execFileSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: "pipe" });

function src(rel) {
  const p = join(SRC, rel.split("/").join(sep));
  if (!existsSync(p)) {
    console.error(`missing source: ${p}`);
    process.exit(1);
  }
  return p;
}

/** A source tuple becomes ffmpeg input args (with -ss for a video frame). */
const inputs = ([path, at]) =>
  at === undefined
    ? ["-i", src(path)]
    : ["-ss", String(at), "-i", src(path), "-frames:v", "1"];

function thumb(spec, dest, fit, ground) {
  const vf =
    fit === "contain"
      ? `scale=${THUMB_W}:${THUMB_H}:force_original_aspect_ratio=decrease,` +
        `pad=${THUMB_W}:${THUMB_H}:(ow-iw)/2:(oh-ih)/2:${ground}`
      : `scale=${THUMB_W}:${THUMB_H}:force_original_aspect_ratio=increase,` +
        `crop=${THUMB_W}:${THUMB_H}`;
  ff([...inputs(spec), "-vf", vf, "-q:v", "3", dest]);
}

const gallery = (spec, dest) =>
  ff([...inputs(spec), "-vf", `scale='min(${GALLERY_MAX},iw)':-2`, "-q:v", "3", dest]);

const video = (rel, dest) =>
  ff([
    "-i", src(rel),
    "-vf",
    `scale=w=${VIDEO_MAX}:h=${VIDEO_MAX}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
    "-c:v", "libx264", "-crf", "23", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
    "-c:a", "aac", "-b:a", "128k", "-ac", "2",
    "-movflags", "+faststart", dest,
  ]);

const mb = (p) => statSync(p).size / 1024 / 1024;
const pad = (n) => String(n).padStart(2, "0");

function build(slug, spec) {
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });
  const ground = spec.ground ?? "0x000000";
  let total = 0;

  const t = join(dir, "thumb.jpg");
  thumb(spec.thumb, t, spec.fit, ground);
  total += mb(t);
  console.log(`  thumb.jpg       ${mb(t).toFixed(2).padStart(6)} MB  (${spec.fit})`);

  let gsum = 0;
  spec.gallery.forEach((g, i) => {
    const p = join(dir, `gallery-${pad(i + 1)}.jpg`);
    gallery(g, p);
    gsum += mb(p);
  });
  if (spec.gallery.length) {
    total += gsum;
    console.log(
      `  gallery-01..${pad(spec.gallery.length)}  ${gsum.toFixed(2).padStart(6)} MB` +
        `  (${spec.gallery.length} images)`
    );
  }

  if (spec.reel) {
    const p = join(dir, "reel.mp4");
    video(spec.reel, p);
    total += mb(p);
    console.log(
      `  reel.mp4        ${mb(p).toFixed(2).padStart(6)} MB  <- ${basename(spec.reel)}`
    );
  }

  spec.clips.forEach((c, i) => {
    const p = join(dir, `clip-${pad(i + 1)}.mp4`);
    video(c, p);
    total += mb(p);
    console.log(
      `  clip-${pad(i + 1)}.mp4     ${mb(p).toFixed(2).padStart(6)} MB  <- ${basename(c)}`
    );
  });

  return total;
}

const wanted = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(PROJECTS);
const unknown = wanted.filter((s) => !PROJECTS[s]);
if (unknown.length) {
  console.error(`unknown slug(s): ${unknown.join(", ")}`);
  process.exit(1);
}

let grand = 0;
for (const slug of wanted) {
  console.log(`\n${slug}`);
  grand += build(slug, PROJECTS[slug]);
}
console.log(`\ntotal written to assets/: ${grand.toFixed(1)} MB`);
