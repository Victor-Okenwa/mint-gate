//! Integration test crate for membership (A1 Part 2).
//!
//! Host-side parse coverage lives in `membership::parse` unit tests.
//! CKB-VM transaction tests (`ckb-testtool`) are intentionally deferred until
//! the RISC-V binary builds — see `contracts-rs/README.md`.

#[cfg(test)]
mod smoke {
    use membership::parse_community_json;

    #[test]
    fn community_json_smoke() {
        let json = r#"{"id":"abc","creatorLockHash":"0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","mintPriceShannons":"0"}"#;
        let c = parse_community_json(json).expect("parse");
        assert_eq!(c.id, "abc");
        assert_eq!(c.mint_price_shannons, 0);
    }
}
