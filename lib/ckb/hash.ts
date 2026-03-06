// lib/ckb/hash.ts
import { blake2b } from "@noble/hashes/blake2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

/**
 * blake2b-256 of a hex string -> 0x-prefixed hex
 */
export function blake2bHex(hex: string): string {
    const normalized = hex.replace(/^0x/, "");
    const bytes = hexToBytes(normalized);
    const hash = blake2b(bytes, { dkLen: 32 });
    return "0x" + bytesToHex(hash);
}

/**
 * blake2b-256 of arbitrary UTF-8 string -> 0x-prefixed hex
 */
export function blake2bHexFromString(str: string): string {
    const encoded = new TextEncoder().encode(str);
    const hash = blake2b(encoded, { dkLen: 32 });
    return "0x" + bytesToHex(hash);
}