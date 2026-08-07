import { NextResponse } from "next/server";

import type { CommunityListItem } from "@/app/api/community/get-all/route";
import { db } from "@/lib/db";
import {
  getMemberCountsByCommunityIds,
  getUserMembershipIds,
} from "@/lib/db/community-queries";
import { communities } from "@/lib/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchValue = (searchParams.get("search") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const offset = (page - 1) * limit;

    if (!searchValue) {
      return NextResponse.json({ error: "search is required" }, { status: 400 });
    }

    const communitiesList = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        mintPrice: communities.mintPrice,
        creatorAddress: communities.creatorAddress,
        txHash: communities.txHash,
      })
      .from(communities)
      .where(ilike(communities.name, `%${searchValue}%`))
      .limit(limit)
      .offset(offset);

    const ids = communitiesList.map((c) => String(c.id));
    const [membersCountByCommunity, membershipIds] = await Promise.all([
      getMemberCountsByCommunityIds(ids),
      getUserMembershipIds(ids, userAddress),
    ]);

    const payload: CommunityListItem[] = communitiesList.map((row) => {
      const id = String(row.id);
      return {
        communityID: id,
        name: row.name ?? "",
        description: row.description ?? "",
        mintPrice: Number(row.mintPrice ?? 0),
        creatorAddress: row.creatorAddress ?? "",
        txHash: row.txHash ?? undefined,
        isCreator: row.creatorAddress === userAddress,
        isMember: userAddress ? membershipIds.has(id) : false,
        membersCount: membersCountByCommunity.get(id) ?? 0,
      };
    });

    return NextResponse.json({ communities: payload });
  } catch (error) {
    console.error("search communities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
