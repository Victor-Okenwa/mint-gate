import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";
import { db } from "@/lib/db";
import { communities, members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = (searchParams.get("community_id") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    if (!communityId || !userAddress) {
      return NextResponse.json(
        { error: "Invalid community id or user address" },
        { status: 400 },
      );
    }

    const [community] = await db
      .select({ txHash: communities.txHash })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    const txHash = community?.txHash;
    if (!txHash) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const cell = await cccClient.getCellLive({ txHash, index: "0x0" }, true);
    if (!cell) {
      return NextResponse.json({ error: "Failed to verify ownership" }, { status: 500 });
    }

    const data = hexToUtf8(cell.outputData);
    const dataToObject = JSON.parse(data);

    if (dataToObject.creatorAddress !== userAddress) {
      return NextResponse.json(
        { error: "You are not the owner of this community" },
        { status: 403 },
      );
    }

    await db.delete(members).where(eq(members.communityId, communityId));
    await db.delete(communities).where(eq(communities.id, communityId));

    return NextResponse.json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("delete community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
