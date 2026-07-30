# [DRAFT] Mint Gate Phase 1 — Chain-true membership + did:ckb

**Grant amount requested:** $8,500 USD equivalent (paid in CKB at the USD value at each disbursement)

**ETA:** ~12 weeks from initial funding

**Network for this grant:** CKB testnet (mainnet production launch out of scope)

---

## Summary

Mint Gate is a token-gating and membership app for Nervos CKB. Creators spin up communities, people pay a gate fee in CKB to join, and members unlock gated access (today: a private link).

This proposal funds **Phase 1**: make membership something the chain can prove — membership Cells, confirmations, a basic indexer so the database is a cache not the authority — and attach `did:ckb` so creators and members have a portable identity, not just a throwaway address.

DevRel guidance for the long game is **Vellum + Mint Gate + governance**. That remains the north star. This grant does **not** ship full Vellum reputation or on-chain mini-DAO voting. It builds the foundation those pieces need. A follow-on grant (Phase 2) is where we integrate Vellum claims and light governance on top.

**Live MVP:** [https://mint-gate.vercel.app](https://mint-gate.vercel.app)  
**Repo:** [https://github.com/Victor-Okenwa/mint-gate](https://github.com/Victor-Okenwa/mint-gate)  
**CKBuilder tracker:** [https://github.com/Nervos-Community-Catalyst/CKBuilder-projects/issues/16](https://github.com/Nervos-Community-Catalyst/CKBuilder-projects/issues/16)

---



## What is Mint Gate?

Mint Gate helps people run **paid, wallet-native communities on CKB**.

In practice:

- A creator connects a CKB wallet and creates a community (name, description, guidelines, mint price, optional gated link).
- Someone who wants in pays the mint price in CKB.
- If they’re a member (or the creator), they can see the gated content the community chose to protect.

The product is intentionally **semi-decentralized**: the chain is for payments and ownership/membership proofs; the hosted app (and Supabase today) is for search, dashboards, and delivering gated URLs. That pattern fits Nervos well — you don’t need to put every sentence of a community description on-chain to get verifiable membership.

I shipped a working vertical slice as an MVP on testnet: wallet connect (CCC), create, pay-to-join, browse/search, membership dashboards. Mentors and reviewers have been clear that the *idea* is viable, but the *trust model* is not ready for real money or for the bigger story (identity + governance) yet. Phase 1 is about fixing that honestly.

---



## The problem we’re solving

CKB communities keep reinventing the same awkward stack: Discord invites, spreadsheets of addresses, or apps that say “on-chain membership” while the real gate is a database row.

Mint Gate’s MVP already shows the product shape people want — but it still has the gaps that matter once CKB is real:

1. **Membership is too easy to fake or lose.** Join records live in Supabase. The API largely trusts client-supplied addresses and tx hashes. A user can pay on-chain and still lose membership if the DB write fails — or get membership without a confirmed payment if we treat mempool acceptance as success.
2. **There is no real membership Cell yet.** Create locks a capacity Cell with community JSON; join is mostly a CKB payment to the creator. Marketing talked about “minting membership”; the code doesn’t fully deliver that. Mentors (see [doitian’s review](https://gist.github.com/doitian/eaecadb3e74c2432db72468458312005)) recommended membership Cells + indexing before xUDT marketplaces or heavier features.
3. **Wallet address ≠ identity.** For mini-DAOs and reputation-aware gating later, we need a stable handle people can carry across apps. That’s what `did:ckb` is for. Building a private identity system inside Mint Gate would be the wrong move when the ecosystem already has a standard and tools like Vellum around it.
4. **Governance and Vellum need a solid base.** You can’t build fair votes or reputation-weighted access on top of a membership list that isn’t recoverable from the chain. Phase 1 exists so Phase 2 isn’t fantasy.

---



## Why this benefits the CKB community

- **Reusable gated communities for builders.** Working groups, cohorts, private builder chats, paid study circles — without every team writing their own contracts from scratch.
- **Value stays on CKB.** Gate fees settle in CKB; membership becomes a Cell people (and other apps) can reason about.
- **We consume ecosystem primitives instead of competing with them.** Phase 1 links `did:ckb`. Phase 2 is designed to consume **Vellum** claims for eligibility or weight, and to add **mini-DAO governance** — the combination DevRel suggested — without Mint Gate pretending to be the identity layer.
- **Honest semi-decentralization.** Clear docs on what the chain proves vs what the app indexes. That trust model is something other CKBuilder projects can copy.
- **A concrete consumer for** `did:ckb`**.** Standards get stronger when real apps use them. Mint Gate is that kind of app: membership and (later) governance sitting on identity people already hold.

---



## Phased roadmap



### Phase 0 — Current (shipped MVP, not funded by this grant)

What exists today on testnet:

- CCC wallet connect
- Create community (capacity Cell with `{ id, creatorAddress }` + Supabase metadata)
- Join by paying mint price in CKB + DB membership row
- Browse, search, my communities / my memberships
- Gated link shown in the UI when the DB says you’re a member or creator
- Creator “delete” that removes the listing from the DB (on-chain Cell remains)

Known limitations (we’re not hiding these): chain-then-DB races, no membership Cell, weak API auth, archive vs delete confusion, UI polish debt, homepage claims ahead of the implementation.

### Phase 1 — This grant (foundation)

Make Mint Gate **chain-authoritative for membership**, with a **basic indexer**, and `did:ckb` **linked** to creators and members. Harden create/join so people don’t lose CKB to orphan state. Document the trust model. Polish the app so a pilot community can use it without apology.

### Phase 2 — Follow-on grant (not funded here)

**Vellum + Mint Gate + governance**:

- Optionally gate join or voting eligibility using Vellum / claim history on a DID
- Mini-DAO style proposals and votes for members of a community (narrow vote types first)
- Only after Phase 1 membership is something the chain can prove

I’m calling this out up front so reviewers know the vision and can judge Phase 1 as a deliberate step, not a diluted idea.

```text
Phase 0 (now)     →  Phase 1 (this grant)      →  Phase 2 (later)
MVP + DB index       Membership Cell + indexer      Vellum claims +
                     + did:ckb link                 mini-DAO governance
```

---



## Phase 1 in detail — what we need to achieve



### 1. Membership Cell + Type Script

- Shared (or parameterized) Type Script for community membership.
- Join transaction: pay gate fee to creator **and** mint a membership Cell locked to the member (soulbound / non-transferable by default).
- Script enforces that the required fee path was satisfied as part of creating that membership.
- Create path updated so community identity on-chain stays consistent with how membership Cells reference a community.



### 2. Confirmations and honest join/create UX

- After broadcast, wait for confirmation (or a clear pending state) — do not treat mempool acceptance as “you’re in.”
- UI copy: “Transaction submitted” vs “Membership active.”
- Recovery path if the app crashes after a confirmed tx: user must not be told to pay again.



### 3. Basic indexer (chain → Supabase)

- Index confirmed community and membership Cells / txs into Supabase.
- Treat the DB as a **cache** for search and dashboards; rebuildable from chain.
- Server grants gated access only when membership can be tied to confirmed on-chain state (live Cell and/or verified confirmed tx), not a self-reported hash alone.



### 4. Archive, not fake delete + trust-model docs

- Rename delete → archive/unlist; explain that the on-chain ownership record remains.
- Archived communities stop accepting new members; document what happens to existing members’ access.
- Short architecture / trust-model doc in the repo: what lives on-chain vs off-chain.



### 5. `did:ckb` link

- Creators and members can create or link a `did:ckb` (via CCC / `@ckb-ccc/did-ckb`).
- Surface the DID on profiles / community context where it matters.
- Store the association so Phase 2 can hang Vellum claims and governance eligibility on the DID without another rewrite.
- **Not in scope:** full Vellum reputation dashboard, `readClaims`-weighted voting, or replacing Vellum.



### 6. Wallet-authenticated API + gating hygiene

- Stop trusting raw `user_address` query params for sensitive actions.
- Signed requests or session after wallet proof for membership-sensitive endpoints.
- Prefer per-member invite credentials where it fits (or document one-key-one-seat limits clearly for shared links).



### 7. Product polish for a real pilot

- Remove placeholder/lorem content; fix broken nav (e.g. `/dashboard`); real footer links.
- Replace boilerplate README with setup, env vars, and architecture.
- One testnet pilot community (aim ~10–20 real joins) and a short demo write-up or video.

---



## Deliverables checklist (Phase 1)


| Deliverable                       | Done when                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| Membership Type Script on testnet | Published code hash / deploy notes; join mints a membership Cell |
| Confirm + verify flows            | Create/join wait for confirm; API verifies before gating         |
| Basic indexer                     | Confirmed cells/txs upsert into Supabase; restore without re-pay |
| Archive + trust docs              | UI/API language fixed; ARCHITECTURE or trust doc in repo         |
| `did:ckb` link                    | Create/link DID in app; shown and stored for members/creators    |
| Pilot + demo                      | One community exercised end-to-end on testnet; demo artifacts    |


---



## Milestones and budget

**Total: $8,500 USD equivalent** over ~12 weeks.


| Milestone | Timing     | Amount | Focus                                                                                         | Acceptance                                                                                                  |
| --------- | ---------- | ------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **M1**    | Weeks 1–4  | $3,000 | Membership Cell + Type Script; join/create confirmation; server-side verification before gate | Script deployed on testnet; join produces membership Cell; gated API rejects unconfirmed/fake joins         |
| **M2**    | Weeks 5–8  | $3,000 | Basic indexer; archive/unlist; trust-model docs; API hardening                                | Indexer (or equivalent sync) rebuilds membership/community rows from chain; archive UX shipped; docs merged |
| **M3**    | Weeks 9–12 | $2,500 | `did:ckb` link in create/join/profile; UI polish; pilot + demo                                | DID linkable in app; polish checklist cleared; pilot notes + demo published                                 |


**Budget split (approximate):**


| Category                                               | Amount     |
| ------------------------------------------------------ | ---------- |
| On-chain script + tx flows (membership, confirmations) | $3,200     |
| Indexer + API trust hardening                          | $2,400     |
| `did:ckb` integration + app UX                         | $2,000     |
| Docs, pilot, project management                        | $700       |
| Infra (hosting, RPC, small ops)                        | $200       |
| **Total**                                              | **$8,500** |


No formal third-party audit in this ask. Scripts stay small and testnet-first; community review welcome.

---



## Out of scope (this grant)

- Full **Vellum** reputation integration (`readClaims`, scoring, issuer flows)
- **On-chain mini-DAO governance** (proposals/votes) — Phase 2
- Marketplace / transferable memberships / community ownership sales
- On-chain chat
- Per-community xUDT as the default membership model
- Formal security audit and mainnet production launch
- Long-term paid ops beyond a reasonable post-M3 maintenance window (see below)

---



## Team

**Victor Okenwa** ([@Victor-Okenwa](https://github.com/Victor-Okenwa)) — solo developer on Mint Gate to date: MVP on testnet, CKBuilder project submission, iteration from mentor feedback.

I’m newer to Web3 than many Nervos veterans, and I’m being deliberate about that: this grant is scoped to foundation work I can ship and demo, with the bigger Vellum + governance chapter called out as a sequel rather than stuffed into an underfunded “everything” proposal.

---



## Risks and mitigations


| Risk                                              | Mitigation                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Script / Cell edge cases take longer than planned | Testnet-only; small script surface; milestone acceptance tied to demoable join path     |
| Indexer complexity                                | “Basic” sync first (confirmed txs / live cells → upsert); perfect realtime infra later  |
| `did:ckb` SDK churn                               | Stick to CCC / published `@ckb-ccc/did-ckb` patterns; link DID, don’t fork the protocol |
| Solo bandwidth                                    | Narrow Phase 1; Phase 2 explicitly deferred                                             |
| Adoption                                          | Pilot one real community; keep UX honest, not oversold                                  |


**Maintenance:** Best-effort maintenance of Phase 1 testnet artifacts for at least **6 months** after M3, and keep the public repo usable for others to run.

---



## Why now

- The MVP is live and reviewable — we’re not asking for funding from a blank repo.
- Mentor feedback already pointed at membership Cells, indexing, and DID for harder auth features.
- `did:ckb` tooling in CCC is maturing; Vellum is pushing identity and reputation as shared infrastructure. Mint Gate is a natural **application** consumer.
- Getting Phase 1 right is what makes Phase 2 (Vellum + governance) fundable and believable.

---



## Closing

I’m asking for **$8,500** to take Mint Gate from “working MVP with a soft trust model” to “chain-true membership with `did:ckb`,” on testnet, in about twelve weeks.

The destination — **Vellum + Mint Gate + governance** — is still the plan. This grant is the ground floor.

Feedback on scope and sequencing is welcome before this draft goes to a public vote. If DevRel r Judges want a thin Vellum or governance *demo* inside Phase 1, I’d rather hear that now and adjust the ask than silently overpromise.

---



## Links

- Live app: [https://mint-gate.vercel.app](https://mint-gate.vercel.app)  
- Repository: [https://github.com/Victor-Okenwa/mint-gate](https://github.com/Victor-Okenwa/mint-gate)  
- CKBuilder issue: [https://github.com/Nervos-Community-Catalyst/CKBuilder-projects/issues/16](https://github.com/Nervos-Community-Catalyst/CKBuilder-projects/issues/16)  
- Mentor review (doitian): [https://gist.github.com/doitian/eaecadb3e74c2432db72468458312005](https://gist.github.com/doitian/eaecadb3e74c2432db72468458312005)  
- `did:ckb` method / contracts: [https://github.com/web5fans/did-ckb](https://github.com/web5fans/did-ckb)  
- Vellum (identity dashboard; Phase 2 consumer context): [https://talk.nervos.org/t/vellum-a-reference-dashboard-and-sdk-for-did-ckb/10274](https://talk.nervos.org/t/vellum-a-reference-dashboard-and-sdk-for-did-ckb/10274)  
- Vellum reputation discussion: [https://talk.nervos.org/t/vellum-extended-from-identity-to-reputation-on-did-ckb/10406](https://talk.nervos.org/t/vellum-extended-from-identity-to-reputation-on-did-ckb/10406)  
- CKB AI / docs entry: [https://docs.nervos.org/docs/ai-agents/ai-resource](https://docs.nervos.org/docs/ai-agents/ai-resource)

