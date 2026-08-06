import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";
import { db } from "@/lib/db";
import { communities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
      return NextResponse.json(
        { error: "Community not found", verified: false },
        { status: 404 },
      );
    }

    const cell = await cccClient.getCellLive({ txHash, index: "0x0" }, true);
    const data = hexToUtf8(cell!.outputData);
    const dataToObject = JSON.parse(data);

    if (dataToObject.creatorAddress === userAddress) {
      return NextResponse.json({ txHash, verified: true });
    }

    return NextResponse.json({ txHash, verified: false });
  } catch (error) {
    console.error("verify ownership:", error);
    return NextResponse.json(
      { error: "Internal server error", verified: false },
      { status: 500 },
    );
  }
}
