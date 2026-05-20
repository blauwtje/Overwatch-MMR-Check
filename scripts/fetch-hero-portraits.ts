/**
 * fetch-hero-portraits.ts
 *
 * Fetches hero portrait images from the OverFast API and writes them to
 * public/heroes/{key}.webp at 128×128 / quality 82.
 *
 * Run: npm run heroes
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const USER_AGENT = "owMMR/1.0 (community tool)";
const BASE_URL = "https://overfast-api.tekrop.fr";
const OUT_DIR = path.resolve(process.cwd(), "public/heroes");
const CONCURRENCY = 4;
const BATCH_DELAY_MS = 200;

// Hero keys copied from lib/overfast/hero-role.ts — kept standalone to avoid
// path-alias issues when tsx runs outside the Next.js module system.
const HERO_KEYS = [
  // Tank
  "dva",
  "doomfist",
  "hazard",
  "junker-queen",
  "mauga",
  "orisa",
  "ramattra",
  "reinhardt",
  "roadhog",
  "sigma",
  "winston",
  "wrecking-ball",
  "zarya",
  // Support
  "ana",
  "baptiste",
  "brigitte",
  "illari",
  "juno",
  "kiriko",
  "lifeweaver",
  "lucio",
  "mercy",
  "moira",
  "zenyatta",
  // Damage
  "ashe",
  "bastion",
  "cassidy",
  "echo",
  "freja",
  "genji",
  "hanzo",
  "junkrat",
  "mei",
  "pharah",
  "reaper",
  "sojourn",
  "soldier-76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "venture",
  "widowmaker",
] as const;

type HeroResponse = {
  portrait?: string;
  [key: string]: unknown;
};

// Set to true the first time a hero response is actually received (not skipped).
let firstResponseSeen = false;

async function fetchHeroPortrait(key: string): Promise<void> {
  const outPath = path.join(OUT_DIR, `${key}.webp`);

  if (fs.existsSync(outPath)) {
    console.log(`[skip] ${key} — already exists`);
    return;
  }

  const url = `${BASE_URL}/heroes/${key}`;
  let res: Response;

  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
  } catch (err) {
    console.error(`[error] ${key} — network error: ${String(err)}`);
    return;
  }

  if (res.status === 404) {
    console.warn(`[404] ${key} — not found, skipping`);
    return;
  }

  if (!res.ok) {
    console.error(`[error] ${key} — HTTP ${res.status}, skipping`);
    return;
  }

  const json = (await res.json()) as HeroResponse;

  // On the first actual API response, log the shape so we can verify the portrait field path.
  if (!firstResponseSeen) {
    firstResponseSeen = true;
    console.log("[debug] first response top-level keys:", Object.keys(json));
    console.log("[debug] portrait field value:", json.portrait ?? "(not found)");
    if (!json.portrait) {
      console.error(
        "[fatal] No `portrait` field in hero response. Check the API shape and update this script."
      );
      process.exit(1);
    }
  }

  const portraitUrl = json.portrait;
  if (!portraitUrl) {
    console.warn(`[warn] ${key} — no portrait field in response, skipping`);
    return;
  }

  let imgRes: Response;
  try {
    imgRes = await fetch(portraitUrl, { headers: { "User-Agent": USER_AGENT } });
  } catch (err) {
    console.error(`[error] ${key} — image fetch error: ${String(err)}`);
    return;
  }

  if (!imgRes.ok) {
    console.error(`[error] ${key} — image HTTP ${imgRes.status}, skipping`);
    return;
  }

  const arrayBuffer = await imgRes.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  await sharp(inputBuffer)
    .resize(128, 128, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outPath);

  console.log(`[ok] ${key} → ${outPath}`);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const keys = [...HERO_KEYS];

  // Process in batches of CONCURRENCY with a delay between each batch.
  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const batch = keys.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map((key) => fetchHeroPortrait(key)));

    if (i + CONCURRENCY < keys.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log("Done.");
}

main().catch((err: unknown) => {
  console.error("[fatal]", err);
  process.exit(1);
});
