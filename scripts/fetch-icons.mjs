#!/usr/bin/env node

/**
 * Favicon fetcher CLI for registrar/DNS brand icons.
 *
 * Sources (tried in order):
 *   1. Google Favicon v2  — https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://{domain}&size={size}
 *   2. DuckDuckGo Icons   — https://icons.duckduckgo.com/ip3/{domain}.ico
 *
 * Usage:
 *   node scripts/fetch-icons.mjs <name> <domain> [options]
 *   node scripts/fetch-icons.mjs amazon aws.amazon.com
 *   node scripts/fetch-icons.mjs epik epik.com --source ddg
 *   node scripts/fetch-icons.mjs azure azure.microsoft.com --size 64
 */

import { mkdirSync, existsSync, statSync, unlinkSync, renameSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const OUT = join(import.meta.dirname, "..", "public", "registrar-icons");

const SOURCES = {
  google: (domain, size) =>
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=${size}`,
  ddg: (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
};

function parseArgs(argv) {
  const args = { names: [], size: 128, source: null, force: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--size":
        args.size = parseInt(argv[++i]) || 128;
        break;
      case "--source":
        args.source = argv[++i];
        break;
      case "--force":
        args.force = true;
        break;
      case "--help":
      case "-h":
        console.log(`Usage: node scripts/fetch-icons.mjs <name> <domain> [...more pairs] [options]

Arguments:
  <name> <domain>  Pairs of brand name and domain (repeatable)

Options:
  --size <px>      Icon size in pixels (default: 128, Google source only)
  --source <src>   Force source: "google" or "ddg"
  --force          Overwrite existing files
  --help           Show this help

Examples:
  node scripts/fetch-icons.mjs amazon aws.amazon.com
  node scripts/fetch-icons.mjs tencent cloud.tencent.com dnspod dnspod.cn
  node scripts/fetch-icons.mjs epik epik.com --source ddg --force`);
        process.exit(0);
      default:
        args.names.push(argv[i]);
    }
  }
  return args;
}

function curlFetch(url, outFile) {
  try {
    const code = execSync(
      `curl -s -L -o "${outFile}" -w "%{http_code}" "${url}"`,
      {
        encoding: "utf-8",
        timeout: 30000,
      },
    ).trim();
    return code === "200";
  } catch {
    return false;
  }
}

function detectFormat(filePath) {
  try {
    const out = execSync(`file -b "${filePath}"`, { encoding: "utf-8" }).trim();
    if (out.includes("PNG")) return { ext: "png", desc: out };
    if (out.includes("JPEG")) return { ext: "jpg", desc: out };
    if (out.includes("GIF")) return { ext: "gif", desc: out };
    if (out.includes("SVG") || out.includes("XML"))
      return { ext: "svg", desc: out };
    if (out.includes("icon")) return { ext: "ico", desc: out };
    return { ext: "png", desc: out };
  } catch {
    return { ext: "png", desc: "unknown" };
  }
}

function sizeLabel(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function fetchIcon(name, domain, opts) {
  const outFile = join(OUT, `${name}.png`);
  if (!opts.force && existsSync(outFile)) {
    console.log(
      `  SKIP  ${name.padEnd(20)} (exists, ${sizeLabel(statSync(outFile).size)})`,
    );
    return;
  }

  const tmpFile = join(OUT, `${name}.tmp`);
  const sources = opts.source ? [opts.source] : ["google", "ddg"];

  let ok = false;
  let usedSource = "";

  for (const src of sources) {
    const url =
      src === "google"
        ? SOURCES.google(domain, opts.size)
        : SOURCES.ddg(domain);
    ok = curlFetch(url, tmpFile);
    if (ok && existsSync(tmpFile) && statSync(tmpFile).size >= 100) {
      usedSource = src;
      break;
    }
    ok = false;
  }

  if (!ok) {
    try {
      unlinkSync(tmpFile);
    } catch {}
    console.log(`  FAIL  ${name.padEnd(20)} no valid icon from any source`);
    return;
  }

  const size = statSync(tmpFile).size;
  const info = detectFormat(tmpFile);
  renameSync(tmpFile, outFile);

  const dim = info.desc.match(/(\d+)\s*x\s*(\d+)/);
  const dimStr = dim ? `${dim[1]}x${dim[2]}` : "??x??";

  console.log(
    `  OK    ${name.padEnd(20)} ${dimStr.padEnd(10)} ${sizeLabel(size).padEnd(8)} ${info.ext.padEnd(4)} [${usedSource}]`,
  );
}

const args = parseArgs(process.argv);

if (args.names.length === 0 || args.names.length % 2 !== 0) {
  console.error(
    "Error: provide pairs of <name> <domain>. Use --help for usage.",
  );
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
console.log(`\nOutput: ${OUT}\n`);

for (let i = 0; i < args.names.length; i += 2) {
  fetchIcon(args.names[i], args.names[i + 1], args);
}

console.log("\nDone!");
