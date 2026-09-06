/**
 * Upload the project videos to Cloudflare R2 and print the public URLs.
 *
 * Dependency-free: R2 speaks the S3 API, and the SigV4 signing below uses only
 * node:crypto. Nothing is installed, no node_modules appears in the repo.
 *
 * Credentials come from .env (gitignored) — never from the command line, so
 * they stay out of shell history:
 *
 *   R2_ACCOUNT_ID=...
 *   R2_ACCESS_KEY_ID=...
 *   R2_SECRET_ACCESS_KEY=...
 *   R2_BUCKET=everiart-video
 *   R2_PUBLIC_BASE=https://video.example.com     (no trailing slash)
 *
 *   node upload_r2.mjs            # upload every video in projects.json
 *   node upload_r2.mjs --check    # don't upload; just verify what's live
 *   node upload_r2.mjs --write    # after a successful upload, repoint projects.json
 */
import { createHash, createHmac } from "node:crypto";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA = join(ROOT, "projects.json");

// ------------------------------------------------------------------ config
function env() {
  const file = join(ROOT, ".env");
  if (!existsSync(file))
    die(".env not found. See the header of this file for the five keys it needs.");

  const cfg = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) cfg[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }

  const need = [
    "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET", "R2_PUBLIC_BASE",
  ];
  const missing = need.filter((k) => !cfg[k]);
  if (missing.length) die(`.env is missing: ${missing.join(", ")}`);

  cfg.R2_PUBLIC_BASE = cfg.R2_PUBLIC_BASE.replace(/\/+$/, "");
  return cfg;
}

const die = (m) => {
  console.error(m);
  process.exit(1);
};

// ------------------------------------------------------------ sigv4 (PUT)
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const hmac = (k, d) => createHmac("sha256", k).update(d).digest();

function signedHeaders({ cfg, key, body, contentType }) {
  const host = `${cfg.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = now.slice(0, 8);
  const payload = sha256(body);
  const path = `/${cfg.R2_BUCKET}/${key}`;

  // Cache immutable: filenames change when content changes (make_media.mjs).
  const headers = {
    host,
    "content-type": contentType,
    "cache-control": "public, max-age=31536000, immutable",
    "x-amz-content-sha256": payload,
    "x-amz-date": now,
  };

  const signedList = Object.keys(headers).sort().join(";");
  const canonical = [
    "PUT",
    path,
    "",
    ...Object.keys(headers).sort().map((h) => `${h}:${headers[h]}`),
    "",
    signedList,
    payload,
  ].join("\n");

  const scope = `${date}/auto/s3/aws4_request`;
  const toSign = [
    "AWS4-HMAC-SHA256", now, scope, sha256(canonical),
  ].join("\n");

  let k = hmac(`AWS4${cfg.R2_SECRET_ACCESS_KEY}`, date);
  for (const part of ["auto", "s3", "aws4_request"]) k = hmac(k, part);
  const signature = createHmac("sha256", k).update(toSign).digest("hex");

  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.R2_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${signedList}, Signature=${signature}`;

  return { url: `https://${host}${path}`, headers };
}

// -------------------------------------------------------------------- work
/** Every local video path referenced by projects.json, in project order. */
function videos() {
  const data = JSON.parse(readFileSync(DATA, "utf8"));
  const out = [];
  for (const p of data.projects) {
    for (const rel of [p.reel, ...(p.clips ?? [])]) {
      if (rel && rel.startsWith("assets/")) out.push({ slug: p.slug, rel });
    }
  }
  return out;
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

async function upload(cfg, rel) {
  const body = readFileSync(join(ROOT, rel));
  const key = rel.replace(/^assets\//, "");
  const { url, headers } = signedHeaders({
    cfg, key, body, contentType: "video/mp4",
  });

  const res = await fetch(url, { method: "PUT", headers, body });
  if (!res.ok)
    die(`upload failed ${res.status} for ${rel}\n${(await res.text()).slice(0, 500)}`);
  return { key, bytes: body.length };
}

/** HEAD the public URL — proves the object is actually reachable, not just stored. */
async function check(cfg, key) {
  const url = `${cfg.R2_PUBLIC_BASE}/${key}`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return {
      url,
      ok: res.ok,
      status: res.status,
      type: res.headers.get("content-type"),
      len: Number(res.headers.get("content-length") || 0),
    };
  } catch (e) {
    return { url, ok: false, status: `network: ${e.message}` };
  }
}

function repoint(cfg) {
  const raw = readFileSync(DATA, "utf8");
  const data = JSON.parse(raw);
  let n = 0;
  for (const p of data.projects) {
    const swap = (rel) =>
      rel && rel.startsWith("assets/")
        ? (n++, `${cfg.R2_PUBLIC_BASE}/${rel.replace(/^assets\//, "")}`)
        : rel;
    p.reel = swap(p.reel);
    p.clips = (p.clips ?? []).map(swap);
  }
  writeFileSync(DATA, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`\nprojects.json: ${n} video path(s) repointed at R2`);
}

// -------------------------------------------------------------------- main
const cfg = env();
const list = videos();
const checkOnly = process.argv.includes("--check");

if (!list.length) die("projects.json references no local videos — nothing to do.");

console.log(`bucket ${cfg.R2_BUCKET}  ->  ${cfg.R2_PUBLIC_BASE}\n`);

for (const { slug, rel } of list) {
  const key = rel.replace(/^assets\//, "");
  if (!checkOnly) {
    if (!existsSync(join(ROOT, rel))) die(`missing local file: ${rel}`);
    const { bytes } = await upload(cfg, rel);
    process.stdout.write(`  uploaded ${key.padEnd(38)} ${mb(bytes).padStart(9)}  `);
  } else {
    process.stdout.write(`  ${key.padEnd(47)}  `);
  }
  const v = await check(cfg, key);
  console.log(v.ok ? `public OK (${v.type}, ${mb(v.len)})` : `NOT PUBLIC (${v.status})`);
}

if (process.argv.includes("--write")) repoint(cfg);
