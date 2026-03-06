import { bytesToHex } from "@noble/hashes/utils.js";
import { blake160 } from "./hash";

export function generateCommunityTypeScript(
    creatorAddress: string,
) {
    // Combine values deterministically
    const timestamp = Date.now().toString();
    const seed = creatorAddress + timestamp;

    // Convert seed to hex
    const seedHex = "0x" + bytesToHex(new TextEncoder().encode(seed));

    const args = blake160(seedHex);

    return {
        codeHash: process.env.NEXT_PUBLIC_XUDT_CODE_HASH!,
        hashType: process.env.NEXT_PUBLIC_HASH_TYPE!,
        args
    }

}