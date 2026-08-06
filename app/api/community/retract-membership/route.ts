import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = (searchParams.get("community_id") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    if (!communityId || !userAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: community_id, user_address" },
        { status: 400 },
      );
    }

    const [membership] = await db
      .select({ id: members.id })
      .from(members)
      .where(
        and(
          eq(members.communityId, communityId),
          eq(members.userAddress, userAddress),
        ),
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this community" },
        { status: 404 },
      );
    }

    await db
      .delete(members)
      .where(
        and(
          eq(members.communityId, communityId),
          eq(members.userAddress, userAddress),
        ),
      );

    return NextResponse.json({ message: "Membership retracted successfully" });
  } catch (error) {
    console.error("retract membership error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
