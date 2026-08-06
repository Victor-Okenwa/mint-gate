import type { CommunityListItem } from "@/app/api/community/get-all/route";
import { db } from "@/lib/db";
import {
  getMemberCountsByCommunityIds,
  getUserMembershipIds,
} from "@/lib/db/community-queries";
import { communities, members } from "@/lib/db/schema";
import { NextResponse } from "next/server";

const MAX_LIMIT = 6;

/**
 * Returns up to `limit` communities ranked by member count (desc).
 * Communities with zero members are used only to fill remaining slots.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(MAX_LIMIT, Number(searchParams.get("limit")) || MAX_LIMIT));
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const [memberRows, communityRows] = await Promise.all([
      db.select({ communityId: members.communityId }).from(members),
      db
        .select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          mintPrice: communities.mintPrice,
          creatorAddress: communities.creatorAddress,
        })
        .from(communities),
    ]);

    const communityById = new Map(communityRows.map((row) => [String(row.id), row]));
    const membersCountByCommunity = new Map<string, number>();

    for (const m of memberRows) {
      const cid = String(m.communityId);
      if (!communityById.has(cid)) continue;
      membersCountByCommunity.set(cid, (membersCountByCommunity.get(cid) ?? 0) + 1);
    }

    const rankedIds = [...communityById.keys()].sort((a, b) => {
      const diff =
        (membersCountByCommunity.get(b) ?? 0) - (membersCountByCommunity.get(a) ?? 0);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });

    const topIds = rankedIds.slice(0, limit);
    const membershipIds = await getUserMembershipIds(topIds, userAddress);

    const payload: CommunityListItem[] = topIds.map((id) => {
      const row = communityById.get(id)!;
      return {
        communityID: id,
        name: row.name ?? "",
        description: row.description ?? "",
        mintPrice: Number(row.mintPrice ?? 0),
        creatorAddress: row.creatorAddress ?? "",
        isCreator: Boolean(userAddress) && row.creatorAddress === userAddress,
        isMember: membershipIds.has(id),
        membersCount: membersCountByCommunity.get(id) ?? 0,
      };
    });

    return NextResponse.json({ communities: payload });
  } catch (error) {
    console.error("getTop:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
