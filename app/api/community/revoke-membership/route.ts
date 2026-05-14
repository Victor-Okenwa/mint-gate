import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";
import { cccClient } from "@/ccc-client";
import { hexToUtf8 } from "@/lib/ckb/hash";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const communityId = (searchParams.get("community_id") ?? "").trim();
        const userAddress = (searchParams.get("user_address") ?? "").trim();
        const requesterAddress = (searchParams.get("requester_address") ?? "").trim();

        if (!communityId || !userAddress || !requesterAddress) {
            return NextResponse.json({ error: "Missing required parameters: community_id, user_address, requester_address" }, { status: 400 });
        }

        // Check if the requester is either the member themselves or the community creator
        let isAuthorized = false;

        // Check if requester is the member themselves (self-revoke)
        if (requesterAddress === userAddress) {
            isAuthorized = true;
        } else {
            // Check if requester is the community creator
            const { data: community, error: fetchError } = await supabaseAdmin
                .from("communities")
                .select("tx_hash")
                .eq("id", communityId)
                .maybeSingle();

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

            if (dataToObject.creatorAddress === requesterAddress) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: "You are not authorized to revoke this membership" }, { status: 403 });
        }

        // Check if the membership exists
        const { data: membership, error: membershipError } = await supabaseAdmin
            .from("members")
            .select("id")
            .eq("community_id", communityId)
            .eq("user_address", userAddress)
            .maybeSingle();

        if (membershipError) {
            return NextResponse.json({ error: membershipError.message }, { status: 500 });
        }

        if (!membership) {
            return NextResponse.json({ error: "Membership not found" }, { status: 404 });
        }

        // Delete the membership
        const { error: deleteError } = await supabaseAdmin
            .from("members")
            .delete()
            .eq("community_id", communityId)
            .eq("user_address", userAddress);

        if (deleteError) {
            console.error("revoke membership:", deleteError);
            return NextResponse.json({ error: "Failed to revoke membership" }, { status: 500 });
        }

        return NextResponse.json({ message: "Membership revoked successfully" });

    } catch (error) {
        console.error("revoke membership error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}