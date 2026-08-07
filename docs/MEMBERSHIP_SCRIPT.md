# Membership Type Script (A1)

This document is the **source of truth** for Mint Gate’s on-chain membership design in grant goal **A1**. The dApp (`lib/ckb/*`) and the Rust Type Script must stay aligned with these shapes.

Related:

- Grant checklist: [`grant-goals.md`](../grant-goals.md) (A1)
- Hash helpers: [`lib/ckb/hash.ts`](../lib/ckb/hash.ts)
- Cell encode/decode: [`lib/ckb/community-cell.ts`](../lib/ckb/community-cell.ts)

---

## Positioning

| Layer | Role |
|-------|------|
| **Join transaction** | Pays the gate fee to the creator **and** mints a **soulbound** membership Cell locked to the member |
| **Membership Cell** | On-chain proof of membership (not only a Postgres row) |
| **Postgres / Drizzle** | Cache / index for search and UX (rebuildable later in A4) |

Membership is **not** xUDT. Do not model seats as fungible tokens in A1.

---

## Identifiers

| Name | Format | Notes |
|------|--------|--------|
| `communityId` | UUID string | Same as today’s app-generated id (`crypto.randomUUID()`) |
| Membership `type.args` | 32-byte blake2b-256 of the UTF-8 `communityId` | Use `blake2bHexFromString` / `communityIdToTypeArgs` — always `0x` + 64 hex chars |

Example:

```text
communityId  = "550e8400-e29b-41d4-a716-446655440000"
type.args    = blake2b256(utf8(communityId))  →  0x<64 hex chars>
```

---

## Community Cell (create)

Created when a creator deploys a community. Used later as a **cell_dep** so the membership Type Script can read mint price and creator lock.

| Field | A1 value |
|-------|----------|
| **Lock** | Creator’s lock script |
| **Type** | None |
| **Capacity** | Enough for occupied capacity + data (today ~301 CKB; may tune later) |
| **Data** | UTF-8 JSON, stored as hex via `utf8ToHex` |

### Data schema (`CommunityCellData`)

```json
{
  "id": "<uuid>",
  "creatorLockHash": "0x…",
  "mintPriceShannons": "<decimal string>"
}
```

| Field | Meaning |
|-------|---------|
| `id` | Community UUID |
| `creatorLockHash` | `0x`-prefixed 32-byte hash of the creator lock script (CCC `script.hash()`) |
| `mintPriceShannons` | Gate fee in **shannons** as a decimal string (no floats). `1 CKB = 100_000_000` shannons |

Use [`buildCommunityCellData`](../lib/ckb/community-cell.ts) / [`encodeCommunityCellData`](../lib/ckb/community-cell.ts) in the dApp — do not hand-roll JSON in pages.

---

## Membership Cell (join)

| Field | A1 value |
|-------|----------|
| **Lock** | Member’s lock script |
| **Type.codeHash** | Deployed membership script (`NEXT_PUBLIC_MEMBERSHIP_CODE_HASH`) |
| **Type.hashType** | As deployed (`type` or `data1`) |
| **Type.args** | `blake2b256(communityId)` |
| **Capacity** | Enough for occupied capacity + data (constant TBD after script size known) |
| **Data** | UTF-8 JSON as hex |

### Data schema (`MembershipCellData`)

```json
{
  "communityId": "<uuid>",
  "memberLockHash": "0x…"
}
```

| Field | Meaning |
|-------|---------|
| `communityId` | Same UUID as the community (human-readable; args remain the hash) |
| `memberLockHash` | `0x`-prefixed 32-byte hash of the member lock |

---

## Join transaction shape

One transaction, conceptually:

1. **Output — payment:** capacity ≥ `mintPriceShannons`, lock = creator lock.  
2. **Output — membership:** type script + member lock + `MembershipCellData`.  
3. **CellDeps:**  
   - Membership **code** cell (deployed script)  
   - **Community** Cell (live cell from create `tx_hash` / index) so the Type Script can validate fee + creator  

Member also provides capacity inputs and pays the normal **network** tx fee (`completeFeeBy`). That is separate from the gate fee.

```text
Inputs:  member capacity cells
Outputs: [ payment → creator ] [ membership Cell → member ] [ change… ]
Deps:    membership code, community Cell
```

---

## Type Script rules (soulbound)

Count cells in the script **group** (same type script as the one running):

| Group inputs | Group outputs | Meaning | Result |
|--------------|---------------|---------|--------|
| 0 | 1 | Mint | Allow only if payment to creator ≥ mint price (from community cell_dep) and args match community id |
| 1 | 0 | Burn / leave | Allow (member destroys cell, recovers capacity) |
| 1 | 1 | Transfer | **Reject** (soulbound — no reassignment to another lock) |
| other | other | Invalid | Reject |

Implemented in `contracts-rs/contracts/membership` (see that crate’s README).

---

## Out of scope for A1

- Confirmations / pending UI (A2)  
- Server-side tx verification before gating (A3)  
- Chain → Postgres indexer (A4)  
- Crash-recovery UX polish (A5)  
- `did:ckb` (Pillar B)  
- Archive (Pillar C)  
- Platform fee % (product later; not “gas”)  
- xUDT / transferable seats  

---

## Implementation status (A1 steps)

| Step | Content | Status |
|------|---------|--------|
| 1 | This spec + `lib/ckb/community-cell.ts` | Done |
| 2 | Rust membership Type Script + tests | Done (`make build` → `contracts-rs/build/release/membership`) |
| 3 | Deploy testnet + env / constants | Not started |
| 4 | Update create-community cell data | Not started |
| 5 | Join tx builder + UI wiring | Not started |
| 6 | Manual testnet verify | Not started |

Update this table as steps land.
