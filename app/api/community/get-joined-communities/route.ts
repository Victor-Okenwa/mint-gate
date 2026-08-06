import { NextResponse } from "next/server";

import type { CommunityListItem } from "@/app/api/community/get-all/route";
import { db } from "@/lib/db";
import { communities, members } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const userAddress = (searchParams.get("user_address") ?? "").trim();
    const offset = (page - 1) * limit;

    if (!userAddress) {
      return NextResponse.json({ communities: [] }, { status: 200 });
    }

    const memberships = await db
      .select()
      .from(members)
      .where(eq(members.userAddress, userAddress))
      .limit(limit)
      .offset(offset);

    if (memberships.length === 0) {
      return NextResponse.json({ communities: [] }, { status: 200 });
    }

    const communityIds = memberships.map((m) => String(m.communityId));

    const communityRows = await db
      .select()
      .from(communities)
      .where(inArray(communities.id, communityIds));

    const communityMap = Object.fromEntries(
      communityRows.map((row) => [String(row.id), row]),
    );
    const ordered = communityIds
      .map((cid) => communityMap[cid])
      .filter(Boolean);

    const payload: CommunityListItem[] = ordered.map((row) => {
      const id = String(row.id);
      return {
        communityID: id,
        name: row.name ?? "",
        description: row.description ?? "",
        mintPrice: Number(row.mintPrice ?? 0),
        creatorAddress: row.creatorAddress ?? "",
        isCreator: row.creatorAddress === userAddress,
        isMember: true,
      };
    });

    return NextResponse.json({ communities: payload });
  } catch (error) {
    console.error("getJoined:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
