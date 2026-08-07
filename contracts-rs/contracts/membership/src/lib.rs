//! Mint Gate **membership** Type Script library.
//!
//! Rules (see `docs/MEMBERSHIP_SCRIPT.md`):
//! - **Mint** (0 typed inputs → 1 typed output): payment to creator ≥ mint price;
//!   `type.args` == blake2b-256(community id UTF-8).
//! - **Burn** (1 → 0): allowed (member leaves / recovers capacity).
//! - **Transfer** (1 → 1): forbidden (soulbound).
//!
//! `main.rs` is the CKB-VM entry; this crate is also built as `rlib` so host
//! unit tests can exercise {@link parse}.

#![cfg_attr(not(test), no_std)]

extern crate alloc;

pub mod error;
pub mod parse;

pub use error::Error;
pub use parse::{decode_lock_hash_hex, parse_community_json, CommunityFields};
