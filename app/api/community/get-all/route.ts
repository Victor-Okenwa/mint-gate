import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  getMemberCountsByCommunityIds,
  getUserMembershipIds,
} from "@/lib/db/community-queries";
import { communities } from "@/lib/db/schema";

export type CommunityListItem = {
  communityID: string;
  name: string;
  description: string;
  mintPrice: number;
  creatorAddress: string;
  isCreator: boolean;
  isMember: boolean;
  membersCount?: number;
  txHash?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const userAddress = (searchParams.get("user_address") ?? "").trim();
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        mintPrice: communities.mintPrice,
        creatorAddress: communities.creatorAddress,
      })
      .from(communities)
      .limit(limit)
      .offset(offset);

    const ids = rows.map((c) => String(c.id));
    const [membersCountByCommunity, membershipIds] = await Promise.all([
      getMemberCountsByCommunityIds(ids),
      getUserMembershipIds(ids, userAddress),
    ]);

    const payload: CommunityListItem[] = rows.map((row) => {
      const id = String(row.id);
      return {
        communityID: id,
        name: row.name ?? "",
        description: row.description ?? "",
        mintPrice: Number(row.mintPrice ?? 0),
        creatorAddress: row.creatorAddress ?? "",
        isCreator: row.creatorAddress === userAddress,
        isMember: userAddress ? membershipIds.has(id) : false,
        membersCount: membersCountByCommunity.get(id) ?? 0,
      };
    });

    return NextResponse.json({ communities: payload });
  } catch (error) {
    console.error("getAll communities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
