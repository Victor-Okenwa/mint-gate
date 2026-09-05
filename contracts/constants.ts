/**
 * On-chain and economic constants for Mint Gate.
 *
 * Membership Type Script values are driven by `NEXT_PUBLIC_MEMBERSHIP_*`
 * after you deploy the RISC-V binary (see `docs/MEMBERSHIP_DEPLOY.md`).
 */

/** @deprecated Placeholder from early xUDT experiments — not used by A1 membership. */
export const TESTNET_XUDT_CODE_HASH =
  process.env.NEXT_PUBLIC_XUDT_CODE_HASH ?? "0xYOUR_DEPLOYED_XUDT_CODE_HASH";

/** @deprecated Prefer {@link MEMBERSHIP_HASH_TYPE} for membership Cells. */
export const TESTNET_HASH_TYPE = "type" as const;

/** 1 CKB = 10^8 shannons. */
export const SHANNONS_PER_CKB = 100_000_000;

/**
 * Legacy capacity ballpark (CKB) used in older helpers.
 * Prefer {@link MEMBERSHIP_CAPACITY_CKB} for membership outputs.
 */
export const CKB_SHANNON_VALUE = 130;

// ---------------------------------------------------------------------------
// Membership Type Script (A1) — populate after deploy
// ---------------------------------------------------------------------------

/**
 * blake2b(binary) with CKB personalization when hashType is `data1`.
 * Compute with: `pnpm membership:code-hash`
 */
export const MEMBERSHIP_CODE_HASH =
  process.env.NEXT_PUBLIC_MEMBERSHIP_CODE_HASH ??
  "0xYOUR_MEMBERSHIP_CODE_HASH";

/**
 * Usually `data1` for immutable code Cells (matches OffCKB / data deploy).
 */
export const MEMBERSHIP_HASH_TYPE = (process.env
  .NEXT_PUBLIC_MEMBERSHIP_HASH_TYPE ?? "data1") as
  | "type"
  | "data"
  | "data1"
  | "data2";

/** Transaction hash of the Cell that stores the membership binary. */
export const MEMBERSHIP_DEP_TX_HASH =
  process.env.NEXT_PUBLIC_MEMBERSHIP_DEP_TX_HASH ??
  "0";

/** Output index of that code Cell (decimal string or number in env). */
export const MEMBERSHIP_DEP_INDEX =
  process.env.NEXT_PUBLIC_MEMBERSHIP_DEP_INDEX ?? "0";

/**
 * Suggested CKB capacity for a membership Cell (data + occupied).
 * Tune after measuring occupied capacity on a real join tx.
 */
export const MEMBERSHIP_CAPACITY_CKB = Number(
  process.env.NEXT_PUBLIC_MEMBERSHIP_CAPACITY_CKB ?? "200",
);
