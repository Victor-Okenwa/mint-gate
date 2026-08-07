//! CKB-VM entry for the membership Type Script.
//!
//! Deployed as a Type Script on membership Cells. Runs once per script group
//! in a transaction (all cells sharing this type code + args).

#![no_std]
#![cfg_attr(not(test), no_main)]

#[cfg(test)]
extern crate alloc;

#[cfg(not(test))]
ckb_std::entry!(program_entry);
#[cfg(not(test))]
ckb_std::default_alloc!(16384, 1258306, 64);

use blake2b_ref::Blake2bBuilder;
use ckb_std::{
    ckb_constants::Source,
    high_level::{
        load_cell_capacity, load_cell_data, load_cell_lock_hash, load_script, QueryIter,
    },
};
use membership::error::Error;
use membership::parse::{bytes_to_utf8, decode_lock_hash_hex, parse_community_json};

/// blake2b-256 aligned with `lib/ckb/hash.ts` → `blake2bHexFromString`.
fn blake2b_256(data: &[u8]) -> [u8; 32] {
    let mut out = [0u8; 32];
    let mut hasher = Blake2bBuilder::new(32).build();
    hasher.update(data);
    hasher.finalize(&mut out);
    out
}

/// CKB-VM entry. `0` = success; non-zero = {@link Error}.
pub fn program_entry() -> i8 {
    match main() {
        Ok(()) => 0,
        Err(e) => e as i8,
    }
}

fn main() -> Result<(), Error> {
    let script = load_script()?;
    let args = script.args().raw_data();
    if args.len() != 32 {
        return Err(Error::InvalidArgs);
    }

    let input_count = count_group(Source::GroupInput)?;
    let output_count = count_group(Source::GroupOutput)?;

    match (input_count, output_count) {
        (0, 1) => validate_mint(args.as_ref()),
        (1, 0) => Ok(()), // burn / leave
        (1, 1) => Err(Error::TransferForbidden),
        _ => Err(Error::InvalidGroup),
    }
}

fn count_group(source: Source) -> Result<usize, Error> {
    // Group* sources already filter to cells with this type script.
    Ok(QueryIter::new(load_cell_lock_hash, source).count())
}

/// Mint: community cell_dep must match args; some output must pay creator.
fn validate_mint(args: &[u8]) -> Result<(), Error> {
    let community = load_matching_community(args)?;
    let creator_lock = decode_lock_hash_hex(&community.creator_lock_hash)
        .map_err(|_| Error::Encoding)?;

    // QueryIter yields successful loads only (ckb-std 0.16).
    let mut paid: u64 = 0;
    for (i, lock_hash) in QueryIter::new(load_cell_lock_hash, Source::Output).enumerate() {
        if lock_hash == creator_lock {
            let cap = load_cell_capacity(i, Source::Output)?;
            paid = paid.saturating_add(cap);
        }
    }

    if paid < community.mint_price_shannons {
        return Err(Error::FeeTooLow);
    }
    Ok(())
}

/// Scan CellDeps for community JSON whose blake2b(id) equals type args.
fn load_matching_community(args: &[u8]) -> Result<membership::CommunityFields, Error> {
    for data in QueryIter::new(load_cell_data, Source::CellDep) {
        let utf8 = match bytes_to_utf8(&data) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let community = match parse_community_json(utf8) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let id_hash = blake2b_256(community.id.as_bytes());
        if id_hash.as_slice() == args {
            return Ok(community);
        }
    }
    Err(Error::CommunityMismatch)
}
