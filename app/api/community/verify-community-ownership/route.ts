import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";
import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const communityId = (searchParams.get("community_id") ?? "").trim();
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    if (!communityId || !userAddress) {
        return NextResponse.json({ error: "Invalid community id or user address" }, { status: 400 });
    }

    // Get all memberships for the user, paged
    const { data: community, error: fetchError } = await supabaseAdmin
        .from("communities")
        .select("tx_hash")
        .eq("id", communityId)
        .maybeSingle();

    const txHash = community?.tx_hash;
    if (!txHash) return NextResponse.json({ error: "Community not found", verified: false }, { status: 404 });
    if (fetchError) return NextResponse.json({ error: fetchError.message, verified: false }, { status: 500 });

    const cell = await cccClient.getCellLive({ txHash, index: "0x0" }, true)
    const data = hexToUtf8(cell!.outputData)

    // Convert to Javaqscript Object
    const dataToObject = JSON.parse(data)
    if (dataToObject.creatorAddress === userAddress) {
        return NextResponse.json({ txHash, verified: true });
    } else {
        return NextResponse.json({ txHash, verified: false });
    }
}