import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";
import { db } from "@/lib/db";
import { communities, members } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = (searchParams.get("community_id") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();
    const requesterAddress = (searchParams.get("requester_address") ?? "").trim();

    if (!communityId || !userAddress || !requesterAddress) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: community_id, user_address, requester_address",
        },
        { status: 400 },
      );
    }

    let isAuthorized = false;

    if (requesterAddress === userAddress) {
      isAuthorized = true;
    } else {
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

      if (dataToObject.creatorAddress === requesterAddress) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You are not authorized to revoke this membership" },
        { status: 403 },
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
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    await db
      .delete(members)
      .where(
        and(
          eq(members.communityId, communityId),
          eq(members.userAddress, userAddress),
        ),
      );

    return NextResponse.json({ message: "Membership revoked successfully" });
  } catch (error) {
    console.error("revoke membership error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
