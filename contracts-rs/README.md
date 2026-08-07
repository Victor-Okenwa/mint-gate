# contracts-rs — Mint Gate on-chain Scripts

Rust workspace for CKB Type Scripts. **A1 Part 2** adds the `membership` script.

| Crate | Purpose |
|-------|---------|
| `contracts/membership` | Soulbound membership Type Script (CKB-VM binary + `rlib` for unit tests) |
| `tests` | Host smoke tests; room for `ckb-testtool` later |

Spec: [`docs/MEMBERSHIP_SCRIPT.md`](../docs/MEMBERSHIP_SCRIPT.md).

## Prerequisites

1. **Rust** (`rustc` / `cargo`).
2. **RISC-V target** (CKB-VM):

```bash
rustup target add riscv64imac-unknown-none-elf
```

3. **clang** on `PATH` (used as `CC` when cross-compiling some native deps). Ubuntu: `clang` package.
4. **Crates from crates.io** (first `cargo build` / `cargo test`):
   - `ckb-std` — syscalls / cell loaders  
   - `blake2b-ref` — pure-Rust blake2b-256 matching `lib/ckb/hash.ts` (no CKB personalization)

## Commands

```bash
cd contracts-rs

# Host unit tests (no RISC-V needed)
cargo test -p membership --lib
cargo test -p membership-tests

# CKB-VM binary
make build
# → build/release/membership
```

## Script behaviour (summary)

| Group in → out | Result |
|----------------|--------|
| 0 → 1 | Mint: find community `cell_dep`, `blake2b(id)==args`, payment ≥ mint price |
| 1 → 0 | Burn/leave: ok |
| 1 → 1 | Transfer: reject |

## Next A1 steps (not this folder alone)

- Deploy binary to testnet → fill `NEXT_PUBLIC_MEMBERSHIP_*`  
- Wire create/join in the Next.js app  
