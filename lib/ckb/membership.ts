/**
 * @file Join transaction builder (A1 Part 5).
 *
 * Builds a single tx that (1) pays the gate fee to the creator and
 * (2) mints a typed membership Cell locked to the member, with cell deps
 * for the membership code + community Cell. See
 * {@link file://docs/MEMBERSHIP_SCRIPT.md}.
 *
 * Requires `NEXT_PUBLIC_MEMBERSHIP_*` after deploy
 * (`docs/MEMBERSHIP_DEPLOY.md`). Placeholders will throw from
 * {@link getMembershipScriptInfo}.
 */

import { ccc } from "@ckb-ccc/core";
import {
  buildMembershipCellData,
  decodeCommunityCellData,
  encodeMembershipCellData,
} from "@/lib/ckb/community-cell";
import {
  buildMembershipTypeScript,
  getMembershipScriptInfo,
  isMembershipScriptConfigured,
} from "@/lib/ckb/membership-script";

/** Extra CKB reserved for network fees (`completeFeeBy`) in balance checks. */
export const JOIN_FEE_BUFFER_CKB = 1;

/** Default community Cell output index from the create tx (single output). */
export const COMMUNITY_CELL_OUTPUT_INDEX = 0;

export type BuildJoinMembershipTxParams = {
  signer: ccc.Signer;
  client: ccc.Client;
  communityId: string;
  creatorAddress: string;
  /** Gate fee in whole CKB (same unit as create form / list cards). */
  mintPriceCkb: number;
  /** Create-community tx hash (community Cell outPoint.txHash). */
  communityTxHash: string;
  /** Community Cell output index; defaults to {@link COMMUNITY_CELL_OUTPUT_INDEX}. */
  communityOutputIndex?: number;
};

export type BuildJoinMembershipTxResult = {
  tx: ccc.Transaction;
  paymentCapacity: bigint;
  membershipCapacity: bigint;
};

/**
 * Minimal capacity (shannons) for a membership Cell = occupied lock + type + data.
 */
export function computeMembershipCellCapacityShannons(
  lock: ccc.ScriptLike,
  type: ccc.ScriptLike,
  dataHex: ccc.HexLike,
): bigint {
  const output = ccc.CellOutput.from({ lock, type }, dataHex);
  return output.capacity;
}

/**
 * Build an unsigned join tx (inputs + fee completed via the signer).
 *
 * Outputs order: `[ payment → creator? ] [ membership → member ]` then change
 * from `completeFeeBy`. Payment is omitted when mint price is 0 (script allows).
 */
export async function buildJoinMembershipTransaction(
  params: BuildJoinMembershipTxParams,
): Promise<BuildJoinMembershipTxResult> {
  const {
    signer,
    client,
    communityId,
    creatorAddress,
    mintPriceCkb,
    communityTxHash,
    communityOutputIndex = COMMUNITY_CELL_OUTPUT_INDEX,
  } = params;

  if (!communityId.trim()) {
    throw new Error("communityId is required");
  }
  if (!creatorAddress.trim()) {
    throw new Error("creatorAddress is required");
  }
  if (!isHex32(communityTxHash)) {
    throw new Error("communityTxHash must be 0x + 64 hex chars");
  }
  if (!Number.isFinite(mintPriceCkb) || mintPriceCkb < 0) {
    throw new Error("mintPriceCkb must be a non-negative number");
  }
  if (!isMembershipScriptConfigured()) {
    throw new Error(
      "Membership Type Script is not configured. Deploy the binary and set NEXT_PUBLIC_MEMBERSHIP_* (see docs/MEMBERSHIP_DEPLOY.md).",
    );
  }

  const scriptInfo = getMembershipScriptInfo();
  const memberAddress = await signer.getRecommendedAddressObj();
  const memberLock = memberAddress.script;
  const memberLockHash = memberLock.hash();

  const { script: creatorLock } = await ccc.Address.fromString(
    creatorAddress,
    client,
  );

  const communityOutPoint = {
    txHash: communityTxHash as ccc.Hex,
    index: communityOutputIndex,
  };

  const communityCell = await client.getCellLive(communityOutPoint, true);
  if (!communityCell) {
    throw new Error(
      "Community Cell not found on chain (spent or wrong tx hash). Cannot join.",
    );
  }

  // Soft-check data so we fail in the dApp before a Type Script reject.
  try {
    const onChain = decodeCommunityCellData(communityCell.outputData);
    if (onChain.id !== communityId) {
      throw new Error(
        `Community Cell id mismatch (on-chain ${onChain.id} vs ${communityId})`,
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("mismatch")) throw e;
    throw new Error(
      "Community Cell data is not valid A1 JSON (recreate the community after Part 4).",
    );
  }

  const membershipData = buildMembershipCellData({
    communityId,
    memberLockHash,
  });
  const membershipDataHex = encodeMembershipCellData(membershipData);
  const membershipType = buildMembershipTypeScript(communityId);
  const membershipCapacity = computeMembershipCellCapacityShannons(
    memberLock,
    membershipType,
    membershipDataHex,
  );

  const paymentCapacity =
    mintPriceCkb > 0 ? ccc.fixedPointFrom(mintPriceCkb) : 0n;

  const outputs: ccc.CellOutputLike[] = [];
  const outputsData: ccc.HexLike[] = [];

  if (paymentCapacity > 0n) {
    outputs.push({
      capacity: paymentCapacity,
      lock: creatorLock,
      type: undefined,
    });
    outputsData.push("0x");
  }

  outputs.push({
    capacity: membershipCapacity,
    lock: memberLock,
    type: membershipType,
  });
  outputsData.push(membershipDataHex);

  const tx = ccc.Transaction.from({
    outputs,
    outputsData,
  });

  tx.addCellDeps(scriptInfo.cellDep);
  tx.addCellDeps({
    outPoint: communityOutPoint,
    depType: "code",
  });

  const balance = await signer.getBalance();
  const feeBuffer = ccc.fixedPointFrom(JOIN_FEE_BUFFER_CKB);
  const required = paymentCapacity + membershipCapacity + feeBuffer;
  if (balance < required) {
    throw new Error(
      `Insufficient balance (need ~${ccc.fixedPointToString(required)} CKB: gate fee + membership cell + ~${JOIN_FEE_BUFFER_CKB} CKB fee buffer)`,
    );
  }

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);

  return { tx, paymentCapacity, membershipCapacity };
}

function isHex32(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}
