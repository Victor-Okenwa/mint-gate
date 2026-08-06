import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getMemberCountsByCommunityIds } from "@/lib/db/community-queries";
import { communities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    const owned = await db
      .select()
      .from(communities)
      .where(eq(communities.creatorAddress, userAddress))
      .limit(limit)
      .offset(offset);

    if (owned.length === 0) {
      return NextResponse.json({ communities: [] }, { status: 200 });
    }

    const ids = owned.map((c) => String(c.id));
    const membersCountByCommunity = await getMemberCountsByCommunityIds(ids);

    const payload = owned.map((row) => {
      const id = String(row.id);
      return {
        communityID: id,
        name: row.name ?? "",
        description: row.description ?? "",
        mintPrice: Number(row.mintPrice ?? 0),
        creatorAddress: row.creatorAddress ?? "",
        isCreator: true,
        isMember: false,
        membersCount: membersCountByCommunity.get(id) ?? 0,
        txHash: row.txHash,
      };
    });

    return NextResponse.json({ communities: payload });
  } catch (error) {
    console.error("getOwned:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
