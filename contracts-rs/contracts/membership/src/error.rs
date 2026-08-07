//! Error codes returned from the membership Type Script to CKB-VM.
//!
//! Non-zero `i8` values fail the transaction. Keep codes stable once
//! deployed — wallets and docs may reference them.

/// Script-level errors for mint / burn / transfer rules.
#[repr(i8)]z
pub enum Error {
    /// Syscall or index failure while loading cells.
    IndexError = 1,
    /// `type.args` is not exactly 32 bytes.
    InvalidArgs = 2,
    /// Input/output group shape is not mint, burn, or (forbidden) transfer.
    InvalidGroup = 3,
    /// Soulbound: membership must not move to another lock (1 in → 1 out).
    TransferForbidden = 4,
    /// Community cell_dep missing, unreadable, or id hash ≠ args.
    CommunityMismatch = 5,
    /// No output pays the creator at least `mintPriceShannons`.
    FeeTooLow = 6,
    /// Cell data is not valid UTF-8 / JSON fields we require.
    Encoding = 7,
}

impl From<ckb_std::error::SysError> for Error {
    fn from(_: ckb_std::error::SysError) -> Self {
        Error::IndexError
    }
}
