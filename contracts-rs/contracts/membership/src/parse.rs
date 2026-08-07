//! Minimal JSON field extraction for community Cell data.
//!
//! Community cells store UTF-8 JSON (see `docs/MEMBERSHIP_SCRIPT.md`).
//! We avoid a full JSON crate in the script binary: only the three fields
//! we need are pulled out with small string scans.
//!
//! Host unit tests (`cfg(test)`) cover these helpers without RISC-V.
//! Crate-level `no_std` lives in `lib.rs` / `main.rs`.

extern crate alloc;

use alloc::string::String;

/// Parsed subset of `CommunityCellData` from the dApp.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CommunityFields {
    pub id: String,
    pub creator_lock_hash: String,
    pub mint_price_shannons: u64,
}

/// Parse community Cell UTF-8 JSON into {@link CommunityFields}.
///
/// Expected shape (extra fields ignored):
/// ```json
/// {
///   "id": "<uuid>",
///   "creatorLockHash": "0x…64 hex…",
///   "mintPriceShannons": "<digits>"
/// }
/// ```
pub fn parse_community_json(utf8: &str) -> Result<CommunityFields, ()> {
    let id = extract_string_field(utf8, "id").ok_or(())?;
    let creator_lock_hash = extract_string_field(utf8, "creatorLockHash").ok_or(())?;
    let price_str = extract_string_field(utf8, "mintPriceShannons").ok_or(())?;
    let mint_price_shannons = parse_u64_digits(&price_str).ok_or(())?;

    if !creator_lock_hash.starts_with("0x") && !creator_lock_hash.starts_with("0X") {
        return Err(());
    }
    let hex_body = &creator_lock_hash[2..];
    if hex_body.len() != 64 || !hex_body.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(());
    }

    Ok(CommunityFields {
        id,
        creator_lock_hash,
        mint_price_shannons,
    })
}

/// Decode `0x`-prefixed 32-byte lock hash into raw bytes.
pub fn decode_lock_hash_hex(hash_0x: &str) -> Result<[u8; 32], ()> {
    let body = hash_0x
        .strip_prefix("0x")
        .or_else(|| hash_0x.strip_prefix("0X"))
        .ok_or(())?;
    if body.len() != 64 {
        return Err(());
    }
    let mut out = [0u8; 32];
    for i in 0..32 {
        let byte = u8::from_str_radix(&body[i * 2..i * 2 + 2], 16).map_err(|_| ())?;
        out[i] = byte;
    }
    Ok(out)
}

fn extract_string_field(json: &str, key: &str) -> Option<String> {
    // Match "key"\s*:\s*"value"
    let key_pat = alloc::format!("\"{}\"", key);
    let start = json.find(&key_pat)?;
    let after_key = &json[start + key_pat.len()..];
    let colon = after_key.find(':')?;
    let after_colon = after_key[colon + 1..].trim_start();
    if !after_colon.starts_with('"') {
        return None;
    }
    let rest = &after_colon[1..];
    let end = rest.find('"')?;
    Some(String::from(&rest[..end]))
}

fn parse_u64_digits(s: &str) -> Option<u64> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    let mut n: u64 = 0;
    for b in s.bytes() {
        n = n.checked_mul(10)?.checked_add((b - b'0') as u64)?;
    }
    Some(n)
}

/// Collect raw bytes as UTF-8 string (script cell data).
pub fn bytes_to_utf8(data: &[u8]) -> Result<&str, ()> {
    core::str::from_utf8(data).map_err(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_community_json() {
        let json = r#"{"id":"550e8400-e29b-41d4-a716-446655440000","creatorLockHash":"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","mintPriceShannons":"100000000"}"#;
        let c = parse_community_json(json).expect("parse");
        assert_eq!(c.id, "550e8400-e29b-41d4-a716-446655440000");
        assert_eq!(c.mint_price_shannons, 100_000_000);
        decode_lock_hash_hex(&c.creator_lock_hash).unwrap();
    }

    #[test]
    fn rejects_bad_price() {
        let json = r#"{"id":"x","creatorLockHash":"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","mintPriceShannons":"12.5"}"#;
        assert!(parse_community_json(json).is_err());
    }
}
