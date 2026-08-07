/**
 * @file Membership Type Script config for the dApp (A1 Part 3).
 *
 * Reads deploy artifacts from env (`NEXT_PUBLIC_MEMBERSHIP_*`) and exposes
 * CCC-friendly script + cell_dep descriptors used when building join txs
 * (Part 5). See `docs/MEMBERSHIP_DEPLOY.md`.
 */

import type { CellDepLike, Hex, Script } from "@ckb-ccc/core";
import {
  MEMBERSHIP_CAPACITY_CKB,
  MEMBERSHIP_CODE_HASH,
  MEMBERSHIP_DEP_INDEX,
  MEMBERSHIP_DEP_TX_HASH,
  MEMBERSHIP_HASH_TYPE,
} from "@/contracts/constants";
import { communityIdToTypeArgs } from "@/lib/ckb/community-cell";

/**
 * Resolved membership script deployment info for transaction building.
 */
export type MembershipScriptInfo = {
  codeHash: Hex;
  hashType: "type" | "data" | "data1" | "data2";
  /** CellDep pointing at the live code Cell on the target network. */
  cellDep: CellDepLike;
  /** Suggested capacity (CKB) for a new membership Cell before exact occupied calc. */
  defaultCapacityCkb: number;
};

/**
 * True when code hash and dep outPoint look configured (not empty / placeholder).
 */
export function isMembershipScriptConfigured(): boolean {
  return (
    isHex32(MEMBERSHIP_CODE_HASH) &&
    isHex32(MEMBERSHIP_DEP_TX_HASH) &&
    !MEMBERSHIP_DEP_TX_HASH.includes("YOUR_") &&
    !MEMBERSHIP_CODE_HASH.includes("YOUR_")
  );
}

/**
 * Load membership script info from {@link "@/contracts/constants"}.
 *
 * @throws If required env-backed constants are missing or malformed
 */
export function getMembershipScriptInfo(): MembershipScriptInfo {
  if (!isHex32(MEMBERSHIP_CODE_HASH)) {
    throw new Error(
      "NEXT_PUBLIC_MEMBERSHIP_CODE_HASH must be 0x + 64 hex chars (see docs/MEMBERSHIP_DEPLOY.md)",
    );
  }
  if (!isHex32(MEMBERSHIP_DEP_TX_HASH)) {
    throw new Error(
      "NEXT_PUBLIC_MEMBERSHIP_DEP_TX_HASH must be set after deploy (see docs/MEMBERSHIP_DEPLOY.md)",
    );
  }

  const index = Number(MEMBERSHIP_DEP_INDEX);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("NEXT_PUBLIC_MEMBERSHIP_DEP_INDEX must be a non-negative integer");
  }

  return {
    codeHash: MEMBERSHIP_CODE_HASH as Hex,
    hashType: MEMBERSHIP_HASH_TYPE,
    cellDep: {
      outPoint: {
        txHash: MEMBERSHIP_DEP_TX_HASH as Hex,
        index,
      },
      depType: "code",
    },
    defaultCapacityCkb: MEMBERSHIP_CAPACITY_CKB,
  };
}

/**
 * Build the Type Script for a community’s membership Cell.
 *
 * @param communityId - Community UUID (hashed into `args`)
 */
export function buildMembershipTypeScript(communityId: string): Script {
  const info = getMembershipScriptInfo();
  return {
    codeHash: info.codeHash,
    hashType: info.hashType,
    args: communityIdToTypeArgs(communityId) as Hex,
  };
}

function isHex32(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}
