import { db } from "@/lib/db";
import { communities, members } from "@/lib/db/schema";
import { CommunityDetail } from "@/utils/constants";
import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = (searchParams.get("community_id") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    if (!communityId) {
      return NextResponse.json({ error: "community_id is required" }, { status: 400 });
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const [[{ total: membersCount }], membership] = await Promise.all([
      db
        .select({ total: count() })
        .from(members)
        .where(eq(members.communityId, communityId)),
      userAddress
        ? db
            .select({ id: members.id })
            .from(members)
            .where(
              and(
                eq(members.communityId, communityId),
                eq(members.userAddress, userAddress),
              ),
            )
            .limit(1)
            .then((rows) => rows[0] ?? null)
        : Promise.resolve(null),
    ]);

    const payload: CommunityDetail = {
      communityID: String(community.id),
      name: community.name ?? "",
      description: community.description ?? "",
      guidelines: Array.isArray(community.guidelines)
        ? community.guidelines.map((item) => String(item))
        : [],
      mintPrice: Number(community.mintPrice ?? 0),
      creatorAddress: community.creatorAddress ?? "",
      hiddenLink: community.hiddenLink ?? null,
      txHash: community.txHash ?? null,
      isMember: membership !== null,
      isCreator: userAddress ? community.creatorAddress === userAddress : false,
      membersCount: Number(membersCount ?? 0),
    };

    return NextResponse.json({ community: payload });
  } catch (error) {
    console.error("getCommunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
