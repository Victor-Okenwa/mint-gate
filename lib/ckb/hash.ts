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

export function utf8ToHex(utf8String: string): string {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(utf8String);
    return (
        "0x" +
        Array.prototype.map
            .call(uint8Array, (byte: number) => {
                return ("0" + (byte & 0xff).toString(16)).slice(-2);
            })
            .join("")
    );
}

/**
 * Decode a `0x`-prefixed (or raw) hex string to UTF-8 text.
 * Used for community / membership Cell `output_data` round-trips.
 */
export function hexToUtf8(hexString: string): string {
    const normalized = hexString.trim().replace(/^0x/i, "");
    if (normalized.length === 0 || normalized.length % 2 !== 0) {
        throw new Error("hexToUtf8: expected even-length hex string");
    }
    if (!/^[0-9a-fA-F]+$/.test(normalized)) {
        throw new Error("hexToUtf8: invalid hex characters");
    }
    const bytes = new Uint8Array(normalized.length / 2);
    for (let i = 0; i < normalized.length; i += 2) {
        bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
    }
    return new TextDecoder("utf-8").decode(bytes);
}