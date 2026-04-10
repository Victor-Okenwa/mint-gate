import { ccc } from "@ckb-ccc/connector-react";

const cccClient = ccc.useCcc();

export async function generateAccountFromPrivateKey(privateKey: string) {
    const signer = new ccc.SignerCkbPrivateKey(cccClient.client, privateKey)

    const lock = await signer.getAddressObjSecp256k1();

    return {
        lockScript: lock.script,
        address: lock.toString(),
        pubKey: signer.publicKey
    }
}

export async function capacityOf(address: string) {
    const addr = await ccc.Address.fromString(address, cccClient.client);
    const balance = await cccClient.client.getBalance([addr.script]);
    return balance;
}