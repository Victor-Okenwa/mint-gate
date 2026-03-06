import { Address, ccc, } from "@ckb-ccc/connector-react";
import { cccClient } from "@/ccc-client";
import { blake2bHexFromString } from "./hash";

/**
 * Convert CKB to shannons hex
 * @param ckb - CKB amount
 * @returns shannons hex
 */
export function ckbToShannonsHex(ckb: number | string): string {
    const shannonsPerCkb = BigInt("100000000");
    const n = BigInt(Math.floor(Number(ckb))) * shannonsPerCkb;
    // return hex string with 0x prefix
    return "0x" + n.toString(16);
}

/**
 * Generate deterministic community id + xUDT type script info.
 * We generate an id (UUID) on server, then args = blake2b(id).
 */
export function generateCommunityIdAndTypeScript(): {
    id: string;
    typeScript: { codeHash: string; hashType: "type" | "data"; args: string };
} {
    // NOTE: crypto.randomUUID is supported in Node 16.8+ / modern browsers.
    const id = crypto.randomUUID();

    // args must be 32 bytes hex -> we'll use blake2b256(id)
    const args = blake2bHexFromString(id);

    const typeScript = {
        codeHash: process.env.NEXT_PUBLIC_XUDT_CODE_HASH!,
        hashType: (process.env.NEXT_PUBLIC_HASH_TYPE as "type" | "data") ?? "type",
        args,
    };

    return { id, typeScript };
}

export async function generateXudtTransaction({ creatorAddress, communityId, xudtCodeHash }: { creatorAddress: string, communityId: string, xudtCodeHash: string }) {
    const addressObject = await Address.fromString(creatorAddress, cccClient);

    //  returns { codeHash: string, hashType: string, args: string }
    const lock = addressObject.script;


    const typeScript = {
        codeHash: xudtCodeHash,
        hashType: "type",
        args: communityId
    }

    const output = {
        lock,
        type: typeScript,
        capacity: "0x37e11d600", // 150 ckb (150 * 10^8) shannons
        data: "0x"
    }

    const tx = ccc.Transaction.from({ outputs: [output] })
    console.log(tx, typeScript);
    return {
        unsignedTx: tx,
        typeScript,
    };
}

generateXudtTransaction({ creatorAddress: "ckt1qyqrdsefa43s6m882pcj53m484k24jy84jj64vvxuj9sn", communityId: "1", xudtCodeHash: "0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e" });