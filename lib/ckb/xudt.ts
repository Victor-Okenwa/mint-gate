import { Address, ccc, } from "@ckb-ccc/connector-react";
import { cccClient } from "@/ccc-client";

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