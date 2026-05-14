import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";
import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const communityId = (searchParams.get("community_id") ?? "").trim();
        const userAddress = (searchParams.get("user_address") ?? "").trim();
        console.log(communityId, userAddress)
        if (!communityId || !userAddress) {
            return NextResponse.json({ error: "Invalid community id or user address" }, { status: 400 });
        }

        // Verify ownership by checking blockchain
        const { data: community, error: fetchError } = await supabaseAdmin
            .from("communities")
            .select("tx_hash")
            .eq("id", communityId)
            .maybeSingle();
        console.log(fetchError, community)
        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const txHash = community?.tx_hash;
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
            return NextResponse.json({ error: "You are not the owner of this community" }, { status: 403 });
        }

        // Delete all members first
        const { error: deleteMembersError } = await supabaseAdmin
            .from("members")
            .delete()
            .eq("community_id", communityId);

        if (deleteMembersError) {
            console.error("delete members:", deleteMembersError);
            return NextResponse.json({ error: "Failed to delete community members" }, { status: 500 });
        }

        // Delete the community
        const { error: deleteCommunityError } = await supabaseAdmin
            .from("communities")
            .delete()
            .eq("id", communityId);

        if (deleteCommunityError) {
            console.error("delete community:", deleteCommunityError);
            return NextResponse.json({ error: "Failed to delete community" }, { status: 500 });
        }

        return NextResponse.json({ message: "Community deleted successfully" });

    } catch (error) {
        console.error("delete community error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}