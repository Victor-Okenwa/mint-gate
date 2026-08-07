#!/usr/bin/env node
/**
 * Print blake2b code hash (CKB personalization) for the membership RISC-V binary.
 *
 * Prefers `ckb-cli util blake2b` when available; falls back to @noble/hashes
 * with personalization `ckb-default-hash` (same as ckb-cli).
 *
 * Usage (repo root):
 *   pnpm membership:code-hash
 *   node scripts/print-membership-code-hash.mjs [path/to/binary]
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { blake2b } from "@noble/hashes/blake2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const defaultBinary = join(
  root,
  "contracts-rs",
  "build",
  "release",
  "membership",
);

const binaryPath = resolve(process.argv[2] ?? defaultBinary);

if (!existsSync(binaryPath)) {
  console.error(`Binary not found: ${binaryPath}`);
  console.error("Run: cd contracts-rs && make build");
  process.exit(1);
}

const cli = spawnSync(
  "ckb-cli",
  ["util", "blake2b", "--binary-path", binaryPath, "--output-format", "json"],
  { encoding: "utf8" },
);

if (cli.status === 0 && cli.stdout?.trim()) {
  try {
    const parsed = JSON.parse(cli.stdout);
    const hash =
      typeof parsed === "string"
        ? parsed
        : (parsed.result ?? parsed.hash ?? parsed);
    if (typeof hash === "string" && hash.startsWith("0x")) {
      printResult(hash, "ckb-cli");
      process.exit(0);
    }
    // yaml-like single line
  } catch {
    const line = cli.stdout.trim().split(/\s+/).pop();
    if (line?.startsWith("0x")) {
      printResult(line, "ckb-cli");
      process.exit(0);
    }
  }
  // ckb-cli often prints bare 0x… on stdout
  const bare = cli.stdout.trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(bare)) {
    printResult(bare, "ckb-cli");
    process.exit(0);
  }
}

const bytes = readFileSync(binaryPath);
const personalization = new TextEncoder().encode("ckb-default-hash");
const digest = blake2b(bytes, { dkLen: 32, personalization });
printResult(`0x${bytesToHex(digest)}`, "@noble/hashes");

/**
 * @param {string} hash
 * @param {string} via
 */
function printResult(hash, via) {
  console.log(hash);
  console.error(`# codeHash (${via}) for data1`);
  console.error(`# binary: ${binaryPath}`);
  console.error("# Set NEXT_PUBLIC_MEMBERSHIP_CODE_HASH to this value after deploy.");
}
