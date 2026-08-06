/**
 * @file Community and membership Cell data helpers (A1).
 *
 * On-chain Cells store UTF-8 JSON in `output_data`, hex-encoded for CCC txs
 * via {@link utf8ToHex}. Shapes are documented in
 * {@link file://docs/MEMBERSHIP_SCRIPT.md}.
 *
 * This module does **not** build or send transactions — it only encodes,
 * decodes, and derives Type Script args. Create/join wiring comes in later A1 steps.
 */

import { CKB_SHANNON_VALUE, SHANNONS_PER_CKB } from "@/contracts/constants";
import { ckbToShannons } from "@/lib/ckb/xudt";
import {
  blake2bHexFromString,
  hexToUtf8,
  utf8ToHex,
} from "@/lib/ckb/hash";

/**
 * JSON payload stored in the community capacity Cell at create time.
 *
 * Loaded later as a `cell_dep` so the membership Type Script can read
 * mint price and the creator lock hash when validating a join (mint).
 */
export type CommunityCellData = {
  /** Community UUID (same id used in Postgres `communities.id`). */
  id: string;
  /**
   * `0x`-prefixed 32-byte hash of the creator’s lock script
   * (CCC: `addressObj.script.hash()`).
   */
  creatorLockHash: string;
  /**
   * Gate fee in shannons as a decimal string (no floats on-chain).
   * Example: `"100000000"` = 1 CKB.
   */
  mintPriceShannons: string;
};

/**
 * JSON payload stored in the membership Cell at join time.
 *
 * The Cell’s **type.args** carry `blake2b256(communityId)`; this data
 * keeps a readable `communityId` and member lock hash for indexers/UX.
 */
export type MembershipCellData = {
  /** Community UUID this membership belongs to. */
  communityId: string;
  /**
   * `0x`-prefixed 32-byte hash of the member’s lock script.
   */
  memberLockHash: string;
};

/**
 * Derive membership Type Script `args` from a community UUID.
 *
 * Must match the Rust script’s expectation: blake2b-256 over the UTF-8
 * bytes of the UUID string (see `blake2bHexFromString`).
 *
 * @param communityId - Community UUID string
 * @returns `0x` + 64 hex characters
 */
export function communityIdToTypeArgs(communityId: string): string {
  return blake2bHexFromString(communityId);
}

/**
 * Encode {@link CommunityCellData} for `Transaction.outputsData`.
 *
 * @param data - Validated community cell payload
 * @returns `0x`-prefixed hex of UTF-8 JSON
 */
export function encodeCommunityCellData(data: CommunityCellData): string {
  assertCommunityCellData(data);
  return utf8ToHex(JSON.stringify(data));
}

/**
 * Decode community Cell `output_data` hex back to {@link CommunityCellData}.
 *
 * @param dataHex - `0x`-prefixed or raw hex from a live cell
 * @throws If JSON is invalid or required fields are missing/wrong types
 */
export function decodeCommunityCellData(dataHex: string): CommunityCellData {
  const parsed: unknown = JSON.parse(hexToUtf8(dataHex));
  assertCommunityCellData(parsed);
  return parsed;
}

/**
 * Encode {@link MembershipCellData} for a membership output’s data.
 */
export function encodeMembershipCellData(data: MembershipCellData): string {
  assertMembershipCellData(data);
  return utf8ToHex(JSON.stringify(data));
}

/**
 * Decode membership Cell `output_data` hex.
 *
 * @throws If JSON is invalid or required fields are missing/wrong types
 */
export function decodeMembershipCellData(dataHex: string): MembershipCellData {
  const parsed: unknown = JSON.parse(hexToUtf8(dataHex));
  assertMembershipCellData(parsed);
  return parsed;
}

/**
 * Build {@link CommunityCellData} from create-form values and the creator lock hash.
 *
 * Converts CKB mint price to shannons via {@link ckbToShannons}.
 * Truncates fractional CKB the same way as existing create helpers
 * (`Math.floor` path in `ckbToShannonsHex` callers should pass whole CKB).
 *
 * @example
 * ```ts
 * buildCommunityCellData({
 *   communityId: id,
 *   creatorLockHash: addressObj.script.hash(),
 *   mintPriceCkb: 10,
 * });
 * ```
 */
export function buildCommunityCellData(props: {
  communityId: string;
  creatorLockHash: string;
  mintPriceCkb: number | string;
}): CommunityCellData {
  const { communityId, creatorLockHash, mintPriceCkb } = props;

  if (!communityId.trim()) {
    throw new Error("communityId is required");
  }
  if (!isHex32(creatorLockHash)) {
    throw new Error("creatorLockHash must be 0x + 64 hex chars");
  }

  const data: CommunityCellData = {
    id: communityId,
    creatorLockHash,
    mintPriceShannons: ckbToShannons(mintPriceCkb).toString(),
  };
  assertCommunityCellData(data);
  return data;
}

/**
 * Build {@link MembershipCellData} for a join membership output.
 */
export function buildMembershipCellData(props: {
  communityId: string;
  memberLockHash: string;
}): MembershipCellData {
  const { communityId, memberLockHash } = props;

  if (!communityId.trim()) {
    throw new Error("communityId is required");
  }
  if (!isHex32(memberLockHash)) {
    throw new Error("memberLockHash must be 0x + 64 hex chars");
  }

  const data: MembershipCellData = {
    communityId,
    memberLockHash,
  };
  assertMembershipCellData(data);
  return data;
}

/**
 * Suggested minimum capacity (CKB) for a membership Cell before exact
 * occupied-capacity calculation is wired. Placeholder until script deploy
 * sizes are known — tune using CCC occupied capacity helpers later.
 *
 * Reuses the project’s existing capacity ballpark constant where useful;
 * create still uses 301 CKB separately.
 */
export const DEFAULT_MEMBERSHIP_CAPACITY_CKB = CKB_SHANNON_VALUE;

/** Shannons per 1 CKB — re-export for callers that document fee math. */
export { SHANNONS_PER_CKB };

function isHex32(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

function assertCommunityCellData(v: unknown): asserts v is CommunityCellData {
  if (typeof v !== "object" || v === null) {
    throw new Error("Community cell data must be an object");
  }
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) {
    throw new Error("Community cell data.id must be a non-empty string");
  }
  if (typeof o.creatorLockHash !== "string" || !isHex32(o.creatorLockHash)) {
    throw new Error(
      "Community cell data.creatorLockHash must be 0x + 64 hex chars",
    );
  }
  if (typeof o.mintPriceShannons !== "string" || !/^\d+$/.test(o.mintPriceShannons)) {
    throw new Error(
      "Community cell data.mintPriceShannons must be a decimal digit string",
    );
  }
}

function assertMembershipCellData(v: unknown): asserts v is MembershipCellData {
  if (typeof v !== "object" || v === null) {
    throw new Error("Membership cell data must be an object");
  }
  const o = v as Record<string, unknown>;
  if (typeof o.communityId !== "string" || !o.communityId.trim()) {
    throw new Error("Membership cell data.communityId must be a non-empty string");
  }
  if (typeof o.memberLockHash !== "string" || !isHex32(o.memberLockHash)) {
    throw new Error(
      "Membership cell data.memberLockHash must be 0x + 64 hex chars",
    );
  }
}
