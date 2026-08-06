import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { communities, members } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { community_id, user_address, tx_hash } = body;

    const [creator, existingMember, community] = await Promise.all([
      db
        .select({ creatorAddress: communities.creatorAddress })
        .from(communities)
        .where(
          and(
            eq(communities.id, community_id),
            eq(communities.creatorAddress, user_address),
          ),
        )
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select({ id: members.id })
        .from(members)
        .where(
          and(
            eq(members.communityId, community_id),
            eq(members.userAddress, user_address),
          ),
        )
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(communities)
        .where(eq(communities.id, community_id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

    if (creator) {
      return NextResponse.json(
        { error: "You can't be a member when you are the creator of this community" },
        { status: 400 },
      );
    }

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this community" },
        { status: 400 },
      );
    }

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    await db.insert(members).values({
      communityId: community_id,
      userAddress: user_address,
      txHash: tx_hash ?? null,
    });

    return NextResponse.json({ message: "Joined community successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
