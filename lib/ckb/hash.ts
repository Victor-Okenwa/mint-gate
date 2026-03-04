import { blake2b } from "@noble/hashes/blake2.js"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js"

/**
 * Blake160 implementation for CKB
 * @param hex - hex string with or without 0x
 */
export function blake160(hex: string): string {
    const normalized = hex.replace(/^0x/, "")
    const bytes = hexToBytes(normalized)

    const hash = blake2b(bytes, { dkLen: 32 })

    // First 20 bytes
    const first20 = hash.slice(0, 20)

    return "0x" + bytesToHex(first20)
}