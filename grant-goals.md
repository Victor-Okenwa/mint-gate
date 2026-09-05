# Mint Gate — Grant-friendly goals

Working checklist for Phase 1 work that mentors and DevRel asked for: **chain-true membership**, **`did:ckb` identity**, plus doitian’s top three suggestions. Use this while implementing; keep [`GRANT.md`](./GRANT.md) as the proposal narrative.

**North star (not all in this checklist):** Vellum + Mint Gate + governance (Phase 2).

**Positioning for this phase:** Paid CKB membership for private community links — semi-decentralized (chain proves payment/membership; Postgres/Drizzle indexes for UX).

**Stack note:** Index/cache is Postgres via Drizzle (`lib/db/`). Treat it as a rebuildable cache, not the authority.

**Workflow:** Follow build order → finish one goal → user confirms → check boxes → ask before next goal.

---

## REMINDER — Testnet membership script deploy

> **Done on testnet (2026-09-05).** Code Cell is live; env + `deployment/scripts.json` are wired.  
> Still required before claiming **A1 complete**: Part 6 manual create + join verify.

- [x] Deploy `contracts-rs/build/release/membership` to **CKB testnet**
- [x] Run `pnpm membership:code-hash` and set `NEXT_PUBLIC_MEMBERSHIP_CODE_HASH`
- [x] Set `NEXT_PUBLIC_MEMBERSHIP_DEP_TX_HASH` + `NEXT_PUBLIC_MEMBERSHIP_DEP_INDEX` after deploy
- [x] Update [`deployment/scripts.json`](./deployment/scripts.json) `testnet.membership` with the live outPoint
- [x] Follow [`docs/MEMBERSHIP_DEPLOY.md`](./docs/MEMBERSHIP_DEPLOY.md)

Live outPoint (testnet):

- codeHash: `0x5ecf5624466f08e329de4b10184157949675dc8ecc785751f59a6eb4338c25a4` (`data1`)
- dep tx: `0xd80a6ee0d5ddefff4e51389949085fc82aa3473329cda9ac45cdff4bffae481a` index `0`

Agent: before claiming A1 complete, confirm Part 6 (successful join mints a live membership Cell).

---

## Build order

- [ ] **1. Pillar A** — Membership Cell + confirm + verify + indexer
- [ ] **2. Pillar C** — Archive + trust-model doc (can overlap with A once A is underway)
- [ ] **3. Pillar B** — `did:ckb` link + UI
- [ ] **4. Pillar D** — UI trim + pilot (cheap wins can start anytime with user OK)

---

## Pillar A — Chain authoritative; DB is a cache

**Mentor ask:** Put community/membership facts in tx data, wait for confirmation, index into the DB; users who paid but hit a server crash must recover without paying again.

- [ ] **Pillar A complete**

### A1. Membership Cell + Type Script

- [ ] **A1 complete**

**Goal:** Joining a community mints an on-chain membership Cell locked to the member. Membership is proven by that Cell (soulbound / non-transferable by default), not only a `members` row.

**A1 implementation steps (local):**

- [x] Spec + `lib/ckb/community-cell.ts` (Part 1)
- [x] Rust Type Script + host tests + RISC-V binary (Part 2)
- [x] Env/constants + deploy docs + testnet deploy (Part 3; see REMINDER above)
- [x] Align create-community on-chain cell data (Part 4)
- [x] Join tx builder + UI wiring (Part 5)
- [ ] Manual verify once script is deployed (Part 6)

**How to achieve it:**

- [x] Design a Type Script (shared code + `communityId` in args, or equivalent) that validates membership mint conditions
- [x] Change the join transaction so it: (1) pays the gate fee to the creator lock, and (2) creates a typed membership output locked to the joiner
- [x] Encode enough facts in cell data / witness (`communityId`, member identity, fee metadata as needed) to rebuild membership from chain alone
- [x] Align create-community on-chain shape so membership Cells can reference the community consistently
- [x] Prefer Rust + `ckb-std`; binary via `contracts-rs` (`make build`)
- [x] **Deploy Type Script on testnet** — see REMINDER ([`docs/MEMBERSHIP_DEPLOY.md`](./docs/MEMBERSHIP_DEPLOY.md))
- [x] Do **not** default every community to xUDT; membership Cell first

**Done when:**

- [x] Type Script deployed on testnet with published code hash / deploy notes
- [ ] Successful join creates a live membership Cell for the member
- [x] Script rejects invalid join shapes in host/unit tests (VM `ckb-testtool` cases can expand later)

### A2. Confirmations (mempool ≠ membership)

- [ ] **A2 complete**

**Goal:** Never treat `sendTransaction` success alone as “you’re in.”

**How to achieve it:**

- [ ] After broadcast on create and join, poll/subscribe until a chosen confirmation depth (or timeout)
- [ ] UI states: “Transaction submitted” → “Confirming…” → “Membership active” / “Community live”
- [ ] Optional: insert `pending` rows keyed by `tx_hash`, promote to active only after confirm + verify

**Done when:**

- [ ] Create and join wait for confirmation before granting active status
- [ ] UI copy distinguishes submitted vs active
- [ ] Documented confirmation depth for testnet

### A3. Server verification before gating

- [ ] **A3 complete**

**Goal:** APIs do not trust self-reported `user_address` + `tx_hash` alone for membership or `hidden_link`.

**How to achieve it:**

- [ ] On membership-sensitive routes, verify confirmed tx and/or live membership Cell
- [ ] Only then return gated content or set `isMember`
- [ ] Prefer wallet signature / session for sensitive mutations (retract, archive, etc.)

**Done when:**

- [ ] `hidden_link` / member flags require chain-backed proof
- [ ] Fake or unconfirmed `tx_hash` cannot unlock gated content
- [ ] Sensitive writes require stronger auth than a query-string address

### A4. Basic indexer (chain → Postgres)

- [ ] **A4 complete**

**Goal:** Drizzle tables are a cache of confirmed chain state and can be rebuilt.

**How to achieve it:**

- [ ] Background job and/or on-demand sync: confirmed txs / live Cells → upsert `communities` / `members`
- [ ] If POST fails after confirmed tx, indexer or “Restore from chain” recreates the row — no second payment
- [ ] Keep rich metadata off-chain keyed by `communityId` (name, description, guidelines, gated URL)

**Done when:**

- [ ] Confirmed create/join appears in DB via index/sync without relying on a single client POST
- [ ] Documented recovery path for “paid but not in DB”
- [ ] Empty/stale DB can be repaired from chain for ownership + membership facts

### A5. Crash recovery UX

- [ ] **A5 complete**

**Goal:** Paying members never get stuck in orphan state with no recourse.

**How to achieve it:**

- [ ] Surface `tx_hash` on failure after broadcast; “Retry save” / “Sync membership” actions
- [ ] On app load for connected wallet, optional check for confirmed txs missing DB rows

**Done when:**

- [ ] User who paid can regain membership without a second payment
- [ ] Failure UI explains what happened and the next step

---

## Pillar B — Identity with `did:ckb`

**Judge / DevRel ask:** Implement `did:ckb` alongside membership trust work. Link identity; do not rebuild Vellum.

- [ ] **Pillar B complete**

### B1. Create or link a DID

- [ ] **B1 complete**

**Goal:** Creators and members can obtain or attach a `did:ckb` via CCC (`@ckb-ccc/did-ckb`).

**How to achieve it:**

- [ ] After wallet connect, offer “Create DID” / “Link existing DID” using official SDK patterns
- [ ] Resolve DID with the CCC client on the configured network (testnet for this phase)
- [ ] Verify against [did:ckb](https://github.com/web5fans/did-ckb) / CCC docs ([`ckbagents.md`](./ckbagents.md))

**Done when:**

- [ ] Connected user can create or link a `did:ckb` in the app
- [ ] DID string is stored and associated with their wallet/address for Mint Gate

### B2. Bind DID to community actors

- [ ] **B2 complete**

**Goal:** Community and membership flows know *who* in DID terms, not only hex addresses.

**How to achieve it:**

- [ ] Persist DID on creator and/or member records (schema migration as needed)
- [ ] Where practical, include DID (or reference) in on-chain cell data/witness; minimum is off-chain association + membership Cell
- [ ] Keep Phase 2 in mind: Vellum claims hang off the DID later

**Done when:**

- [ ] Creator has an associated DID when creating (or clear prompt to link first)
- [ ] Members can link DID; association visible in data model
- [ ] No custom “Mint Gate identity protocol” — we consume `did:ckb`

### B3. Surface DID in the UI

- [ ] **B3 complete**

**Goal:** Reviewers can see identity is first-class.

**How to achieve it:**

- [ ] Show DID (truncated + copy) on profile / my account / community member or creator sections
- [ ] Empty state: CTA to create/link DID

**Done when:**

- [ ] DID visible where creator/member identity matters
- [ ] Copy/link UX works on mobile and desktop

### B4. Explicitly out of scope for this pillar

- [x] Acknowledged — not implementing in Phase 1:
  - Full Vellum reputation dashboard
  - `readClaims` / reputation-weighted join or votes
  - Mini-DAO governance
  - Replacing Vellum as the identity product

---

## Pillar C — Archive + trust model

**Mentor ask:** Rebrand “delete” as “archive” and document what lives on-chain vs in the DB, and what happens to paying members when a community is archived.

- [ ] **Pillar C complete**

### C1. Delete → Archive

- [ ] **C1 complete**

**Goal:** Product language matches reality (unlist / archive; on-chain ownership Cell remains).

**How to achieve it:**

- [ ] Rename UI (`CommunityCardDeleteButton`, dialogs, toasts) and API semantics from delete → archive
- [ ] Add community `status` (e.g. `active` | `archived`); archived excluded from discovery and blocked from new joins
- [ ] Do not claim the on-chain community Cell is destroyed unless actually spent (Phase 1: archive = index/listing)

**Done when:**

- [ ] No user-facing “Delete community” that only drops DB rows without explanation
- [ ] Archive stops new joins; listing behavior documented
- [ ] Copy states that on-chain ownership record remains

### C2. Paying-member policy on archive

- [ ] **C2 complete**

**Goal:** Clear rules for people who already paid.

**How to achieve it:**

- [ ] Decide and document: do existing members keep gated-link access after archive?
- [ ] Enforce that policy in API + UI

**Done when:**

- [ ] Policy written in trust doc and reflected in code
- [ ] Members are not silently locked out without warning when a creator archives

### C3. Trust-model document

- [ ] **C3 complete**

**Goal:** One short doc reviewers can read in minutes.

**How to achieve it:**

- [ ] Add `docs/TRUST_MODEL.md` (or README section) covering on-chain vs Postgres, confirm/indexer recovery, archive, limits
- [ ] Link it from README and footer Docs

**Done when:**

- [ ] Trust doc merged and linked
- [ ] Matches shipped behavior (no aspirational lies)

---

## Pillar D — Positioning and UI trim

**Mentor ask:** Pick one positioning; remove lorem; fix nav/footer; align homepage with shipped features; run a testnet pilot.

- [ ] **Pillar D complete**

### D1. Positioning and marketing honesty

- [ ] **D1 complete**

**Goal:** Homepage and in-app copy match what Phase 1 actually ships.

**How to achieve it:**

- [ ] Lead with: paid CKB membership → private community link
- [ ] Do not promise portable membership Cells, governance, or Vellum until those are live
- [ ] Soften or remove claims that overshoot the code

**Done when:**

- [ ] Landing/how-it-works text matches shipped flows
- [ ] No “governance” / “mint membership cell” claims unless implemented

### D2. UI cleanup

- [ ] **D2 complete**

**Goal:** No embarrassing placeholders for a grant review.

**How to achieve it:**

- [ ] Remove lorem ipsum on community detail ([`app/(public)/community/[id]/page.tsx`](./app/(public)/community/[id]/page.tsx))
- [ ] Fix dead links (e.g. `/dashboard` → `/my-communities` or `/communities`)
- [ ] Footer: real GitHub / docs links (not `#`)
- [ ] Create/join progress and error recovery as in Pillar A

**Done when:**

- [ ] No lorem on community pages
- [ ] No broken primary CTAs
- [ ] Footer links work

### D3. README / developer docs

- [ ] **D3 complete**

**Goal:** Outsiders can run and understand the project.

**How to achieve it:**

- [ ] Keep Drizzle/Docker setup accurate; add architecture + trust-model pointers
- [ ] Env var list; network (`NEXT_PUBLIC_NETWORK`); how create/join relate to chain vs DB

**Done when:**

- [ ] README is not create-ccc-app boilerplate alone
- [ ] New contributor can run locally from docs

### D4. Testnet pilot

- [ ] **D4 complete**

**Goal:** Real usage evidence for reviewers.

**How to achieve it:**

- [ ] One pilot community on testnet; target ~10–20 joins
- [ ] Note failure cases and fix the worst
- [ ] Short demo (notes, screenshots, or video) for the grant/update thread

**Done when:**

- [ ] Pilot community exercised end-to-end
- [ ] Short write-up or demo artifact published

---

## Cross-cutting hygiene (support the pillars)

- [ ] Wallet-authenticated APIs — sign-in / signed payloads for mutations; reduce spoofable `user_address`
- [ ] Gating hygiene — prefer per-member invites when stakes rise; document one-key-one-seat for shared links
- [ ] Types / structure — no `any`; feature folders; JSDoc on non-obvious exports
- [ ] CKB source of truth — official docs / `llms.txt`; Cell model; CCC for dApp; verify before coding

---

## Explicitly deferred (Phase 2+)

Do not block Phase 1 grant-friendliness on these:

- [x] Deferred: Vellum `readClaims` / reputation-weighted eligibility
- [x] Deferred: On-chain mini-DAO proposals and votes
- [x] Deferred: Marketplace, transferable memberships, ownership sales
- [x] Deferred: On-chain chat
- [x] Deferred: Default per-community xUDT
- [x] Deferred: Formal audit + mainnet production launch

---

## Progress snapshot (update as you go)

| Goal | Status |
|------|--------|
| A1 Membership Cell + Type Script | [ ] in progress (Parts 1–4 done; join + **testnet deploy** left) |
| A1 testnet script deploy (deferred) | [ ] **REMINDER** — see section above |
| A2 Confirmations | [ ] |
| A3 Server verification | [ ] |
| A4 Basic indexer | [ ] |
| A5 Crash recovery UX | [ ] |
| C1 Delete → Archive | [ ] |
| C2 Paying-member policy | [ ] |
| C3 Trust-model document | [ ] |
| B1 Create or link DID | [ ] |
| B2 Bind DID to actors | [ ] |
| B3 Surface DID in UI | [ ] |
| D1 Positioning honesty | [ ] |
| D2 UI cleanup | [ ] |
| D3 README / docs | [ ] |
| D4 Testnet pilot | [ ] |

---

## Definition of “grant-friendly enough” for this slice

- [ ] **Join** creates a **membership Cell**, waits for **confirm**, **indexes** into Postgres — with **recovery** if the first DB write fails
- [ ] User has a linked **`did:ckb`** visible in the app
- [ ] Creator **archives** (not “deletes”) with a short **trust-model** doc
- [ ] Product looks intentional: **no lorem**, honest copy, **pilot** on testnet
