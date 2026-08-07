# Deploy membership Type Script (A1 Part 3)

> **Deferred while developing locally.** Env wiring and `codeHash` tooling are ready; you do **not** need a live testnet Cell until a real on-chain join.  
> Tracked in [`grant-goals.md`](../grant-goals.md) under **REMINDER — Testnet membership script deploy**. Come back here before claiming A1 complete.

How to put the RISC-V binary on **CKB testnet** (or devnet) and wire Mint Gate env vars.

Prerequisites:

- Built binary: `cd contracts-rs && make build` → `contracts-rs/build/release/membership`
- [`ckb-cli`](https://github.com/nervosnetwork/ckb-cli) on `PATH`
- A funded testnet account (CKB for capacity + fees)

Related: [`MEMBERSHIP_SCRIPT.md`](./MEMBERSHIP_SCRIPT.md), [`contracts/constants.ts`](../contracts/constants.ts).

---

## 1. Compute `codeHash` (hashType `data1`)

For `hashType: "data1"`, `codeHash` is the blake2b of the **binary bytes** with CKB personalization `ckb-default-hash`. It does **not** change when you redeploy the same bytes; only the **outPoint** (tx hash / index) changes.

```bash
# From repo root
pnpm membership:code-hash

# Or:
ckb-cli util blake2b --binary-path contracts-rs/build/release/membership
```

Example (current release build; re-run after every `make build` if the binary changed):

```text
0x5ecf5624466f08e329de4b10184157949675dc8ecc785751f59a6eb4338c25a4
```

Use this as `NEXT_PUBLIC_MEMBERSHIP_CODE_HASH`.

---

## 2. Deploy the binary as a Cell (testnet)

You need a live Cell whose `data` is the membership ELF and whose type/lock you control. Common approaches:

### Option A — `ckb-cli` (recommended for Rust binaries)

1. Configure `ckb-cli` for testnet RPC (e.g. `https://testnet.ckb.dev`).
2. Import / unlock a funded account.
3. Create a deploy transaction that stores the binary in cell data (follow current [CKB Script Deployment](https://docs.nervos.org/docs) / ckb-cli deploy docs for your CLI version). Prefer **Type ID** only if you need upgradeability later; A1 can use immutable **data1** deployment.

Record:

| Field | Env var |
|-------|---------|
| `codeHash` (from step 1) | `NEXT_PUBLIC_MEMBERSHIP_CODE_HASH` |
| `hashType` | `NEXT_PUBLIC_MEMBERSHIP_HASH_TYPE=data1` |
| Deploy tx hash | `NEXT_PUBLIC_MEMBERSHIP_DEP_TX_HASH` |
| Output index of code cell | `NEXT_PUBLIC_MEMBERSHIP_DEP_INDEX` (usually `0x0` / `0`) |

### Option B — OffCKB (devnet)

Local OffCKB workflows often expect artifacts under `dist/`. You can copy the binary for tooling experiments:

```bash
mkdir -p dist
cp contracts-rs/build/release/membership dist/membership
```

The stock `pnpm deploy` path targets `.bc` files from the old OffCKB JS contract pipeline — **Rust membership is not that path**. Prefer `ckb-cli` (or OffCKB’s documented Rust deploy flow if you use one) for this script.

---

## 3. Fill `.env.local`

Copy from `.env.example` and set:

```bash
NEXT_PUBLIC_MEMBERSHIP_CODE_HASH=0x5ecf5624466f08e329de4b10184157949675dc8ecc785751f59a6eb4338c25a4
NEXT_PUBLIC_MEMBERSHIP_HASH_TYPE=data1
NEXT_PUBLIC_MEMBERSHIP_DEP_TX_HASH=0xYOUR_DEPLOY_TX_HASH
NEXT_PUBLIC_MEMBERSHIP_DEP_INDEX=0
NEXT_PUBLIC_MEMBERSHIP_CAPACITY_CKB=200
```

Restart `pnpm dev` after changes (`NEXT_PUBLIC_*` are baked in at build/dev start).

---

## 4. Record in `deployment/scripts.json`

After a successful deploy, add an entry under `testnet` (or `devnet`) so the team can find the outPoint without digging through chat. Shape:

```json
"membership": {
  "codeHash": "0x…",
  "hashType": "data1",
  "cellDeps": [
    {
      "cellDep": {
        "outPoint": { "txHash": "0x…", "index": 0 },
        "depType": "code"
      }
    }
  ]
}
```

A placeholder object already exists under `testnet.membership` — replace the zeros after deploy.

---

## 5. Sanity check in the app

```ts
import { getMembershipScriptInfo, isMembershipScriptConfigured } from "@/lib/ckb/membership-script";

isMembershipScriptConfigured(); // true when code hash + dep tx are set
getMembershipScriptInfo();      // { codeHash, hashType, cellDep }
```

Join/create wiring (Parts 4–5) will call these helpers when building transactions.

---

## What Part 3 does **not** do

- Does not send a real testnet tx for you (needs your key + funded address).
- Does not change create/join UI yet (Parts 4–5).
- Does not run the indexer (A4).

---

## Checklist

- [ ] `make build` produces `contracts-rs/build/release/membership`
- [ ] `pnpm membership:code-hash` matches your binary
- [ ] Script Cell live on testnet (or devnet)
- [ ] `.env.local` filled with code hash + dep outPoint
- [ ] `deployment/scripts.json` updated for the network you used
