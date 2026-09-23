#!/usr/bin/env node
// Keeps the numbers on this site honest.
//
// Every figure on the page that comes from the app's configuration is marked
// with `data-rule="<key>"`. This script reads `TOKEN_RULES` and `COSMETICS`
// from the app repository, works out what each key should say, and fails if
// the page says something else — or if the app has grown a rule the page does
// not mention at all. It is how the page drifted before: the app halved the
// message award and the daily pool, and nothing here noticed for two weeks.
//
// Source of truth, in order:
//   LANGX_SHARED_DIR=../langx/packages/shared/src  a local checkout
//   (default)  https://raw.githubusercontent.com/langx/langx/main/…
//
// It also checks the SEO scaffolding that is easy to break by hand across
// eight copies of one page: each page's canonical points at itself, every
// page lists the same hreflang set, the sitemap lists every page, and the
// FAQ's JSON-LD says word for word what the visible FAQ says.
//
// No dependencies, no build step — the same promise as the rest of the repo.
//
//   node tools/check-token-rules.mjs

import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://token.langx.io";
const RAW = "https://raw.githubusercontent.com/langx/langx/main/packages/shared/src";

// ------------------------------------------------------------ the rules --

async function source(file) {
  const dir = process.env.LANGX_SHARED_DIR;
  if (dir) return readFile(join(dir, file), "utf8");
  const res = await fetch(`${RAW}/${file}`);
  if (!res.ok) throw new Error(`${RAW}/${file}: HTTP ${res.status}`);
  return res.text();
}

// Pull one `export const NAME … = <literal>` out of a TypeScript file and
// evaluate the literal. Both constants are plain data — numbers, strings,
// nested objects, `60 * 60 * 1000` — so this is safe without a TypeScript
// compiler, and it keeps the script free of the app's imports (zod et al).
function literal(src, name) {
  const at = src.indexOf(`export const ${name}`);
  if (at < 0) throw new Error(`${name} not found`);
  const eq = src.indexOf("=", at);
  let i = eq + 1;
  while (/\s/.test(src[i])) i++;
  const open = src[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  const start = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
    } else if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
    } else if (c === "'" || c === '"' || c === "`") {
      for (i++; src[i] !== c; i++) if (src[i] === "\\") i++;
    } else if (c === open) {
      depth++;
    } else if (c === close && --depth === 0) {
      return new Function(`return (${src.slice(start, i + 1)})`)();
    }
  }
  throw new Error(`${name}: unbalanced literal`);
}

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

// Keys in TOKEN_RULES that the page deliberately does not print. Anything not
// on this list must appear on every page — so a rule the app adds tomorrow
// fails this check until somebody decides where it goes.
const NOT_ON_PAGE = new Set([
  "pool.weights.mutualConversations", // the formula is in the docs
  "pool.weights.corrections",
  "pool.weights.messages",
  "pool.weights.distinctPartners",
  "pool.messageCountCap",
  "pool.maxShareOfPool", // printed as derived.poolMaxSharePercent
  "gift.cooldownMs", // "every hour" — words, not a figure
  "gift.tiers", // printed as derived.giftMax / derived.giftMean
  "gift.maxClaimsPerDay",
]);

function expected(rules, cosmetics) {
  const v = flatten(rules, "", {});
  for (const k of Object.keys(v)) if (k.startsWith("gift.tiers")) delete v[k];
  delete v["gift.tiers"];

  const d = (k, x) => (v[`derived.${k}`] = x);
  d("correctionPerMessage", rules.award.correction / rules.award.message);
  d("poolMaxShare", Math.round(rules.pool.total * rules.pool.maxShareOfPool));
  d("poolMaxSharePercent", Math.round(rules.pool.maxShareOfPool * 100));
  d("echoDailyMax", rules.award.echoSession * rules.caps.echoSessionsPerDay);
  const tiers = rules.gift.tiers;
  const weight = tiers.reduce((s, t) => s + t.weight, 0);
  d("giftMax", tiers[tiers.length - 1].max);
  d("giftMean", Math.round(tiers.reduce((s, t) => s + (t.weight * (t.min + t.max)) / 2, 0) / weight));

  const kinds = new Set(cosmetics.map((c) => c.kind));
  for (const k of kinds) {
    if (!["frame", "title", "stickers"].includes(k)) {
      throw new Error(`cosmetic kind "${k}" is new — decide how the page shows it`);
    }
  }
  for (const kind of ["frame", "title"]) {
    const open = cosmetics.filter((c) => c.kind === kind && !c.requires);
    d(`${kind}Count`, open.length);
    d(`${kind}Min`, Math.min(...open.map((c) => c.price)));
    d(`${kind}Max`, Math.max(...open.map((c) => c.price)));
  }
  const packs = cosmetics.filter((c) => c.kind === "stickers");
  d("stickerPackCount", packs.length);
  const sizes = new Set(packs.map((p) => p.stickers.length));
  d("stickersPerPack", sizes.size === 1 ? [...sizes][0] : NaN);
  for (const c of cosmetics) {
    if (c.kind === "stickers" || c.requires) flatten({ price: c.price, requires: c.requires ?? {} }, `cosmetic.${c.id}`, v);
  }
  return v;
}

function required(v) {
  return Object.keys(v).filter((k) => !NOT_ON_PAGE.has(k));
}

// --------------------------------------------------------------- pages --

const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, fourteen: 14, twenty: 20,
};

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;|&#39;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

// A figure as printed, in any of the page's languages: "1,000", "1.000",
// "1 000", "٥٠", "25K", "1,5K", "ten". Grouping separators are dropped; a
// K/M suffix (only used in the streak chart) makes the separator a decimal.
function read(text) {
  const t = text.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  const compact = t.match(/(\d+(?:[.,]\d+)?)\s*([KkMm])\b/);
  if (compact) {
    return Number(compact[1].replace(",", ".")) * (/[Kk]/.test(compact[2]) ? 1e3 : 1e6);
  }
  const digits = t.replace(/[^\d]/g, "");
  if (digits) return Number(digits);
  const word = WORDS[t.toLowerCase().replace(/[^a-z]/g, "")];
  return word ?? NaN;
}

async function pages() {
  const found = [{ file: "index.html", path: "/" }];
  for (const entry of await readdir(ROOT)) {
    const file = join(entry, "index.html");
    try {
      if ((await stat(join(ROOT, entry))).isDirectory() && (await stat(join(ROOT, file)))) {
        found.push({ file, path: `/${entry}/` });
      }
    } catch {}
  }
  return found;
}

const attr = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

// ---------------------------------------------------------------- main --

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const [tokenSrc, cosmeticsSrc] = await Promise.all([source("token.ts"), source("cosmetics.ts")]);
const want = expected(literal(tokenSrc, "TOKEN_RULES"), literal(cosmeticsSrc, "COSMETICS"));
const mustShow = required(want);

const all = await pages();
const hreflangSets = [];

for (const { file, path } of all) {
  const html = await readFile(join(ROOT, file), "utf8");
  const shown = new Set();

  for (const m of html.matchAll(/<(\w+)\b[^>]*\bdata-rule="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    const [, , key, inner] = m;
    shown.add(key);
    if (!(key in want)) {
      fail(file, `data-rule="${key}" is not a rule the app has`);
      continue;
    }
    const got = read(decode(inner));
    if (got !== want[key]) fail(file, `${key} says "${decode(inner)}", the app says ${want[key]}`);
  }
  for (const key of mustShow) if (!shown.has(key)) fail(file, `never shows ${key} (${want[key]})`);

  // Canonical, hreflang.
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/g);
  if (canonical.length !== 1 || canonical[0] !== ORIGIN + path) {
    fail(file, `canonical should be ${ORIGIN + path}, is ${canonical.join(", ") || "missing"}`);
  }
  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((m) => `${m[1]} ${m[2]}`)
    .sort();
  if (!alternates.some((a) => a.endsWith(" " + ORIGIN + path))) fail(file, "hreflang set does not include the page itself");
  hreflangSets.push(alternates.join("\n"));

  // FAQ: the JSON-LD must be the visible text, not a paraphrase of it.
  const questions = attr(html, /<h3[^>]*\bdata-faq-q\b[^>]*>([\s\S]*?)<\/h3>/g).map(decode);
  const answers = attr(html, /<div[^>]*\bdata-faq-a\b[^>]*>([\s\S]*?)<\/div>/g).map(decode);
  const ld = attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((j) => JSON.parse(j));
  const faq = ld.flatMap((j) => j["@graph"] ?? [j]).find((n) => n["@type"] === "FAQPage");
  if (questions.length) {
    if (!faq) fail(file, "has a FAQ but no FAQPage JSON-LD");
    else {
      const q = faq.mainEntity.map((e) => e.name);
      const a = faq.mainEntity.map((e) => e.acceptedAnswer.text);
      if (q.length !== questions.length) fail(file, `FAQ has ${questions.length} questions, JSON-LD has ${q.length}`);
      questions.forEach((text, i) => {
        if (q[i] !== text) fail(file, `FAQ question ${i + 1} differs from JSON-LD:\n    page: ${text}\n    json: ${q[i]}`);
        if (a[i] !== answers[i]) fail(file, `FAQ answer ${i + 1} differs from JSON-LD:\n    page: ${answers[i]}\n    json: ${a[i]}`);
      });
    }
  }
}

if (new Set(hreflangSets).size > 1) fail("*", "pages disagree on the hreflang set");

const sitemap = await readFile(join(ROOT, "sitemap.xml"), "utf8");
const locs = new Set(attr(sitemap, /<loc>([^<]+)<\/loc>/g));
for (const { file, path } of all) if (!locs.has(ORIGIN + path)) fail("sitemap.xml", `missing ${ORIGIN + path} (${file})`);

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`✓ ${all.length} page(s) agree with TOKEN_RULES and COSMETICS (${mustShow.length} rules each).`);
