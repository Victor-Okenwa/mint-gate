import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const communityId = (searchParams.get("community_id") ?? "").trim();
        const userAddress = (searchParams.get("user_address") ?? "").trim();

        if (!communityId || !userAddress) {
            return NextResponse.json({ error: "Missing required parameters: community_id, user_address" }, { status: 400 });
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
            return NextResponse.json({ error: "You are not a member of this community" }, { status: 404 });
        }

        // Delete the membership
        const { error: deleteError } = await supabaseAdmin
            .from("members")
            .delete()
            .eq("community_id", communityId)
            .eq("user_address", userAddress);

        if (deleteError) {
            console.error("retract membership:", deleteError);
            return NextResponse.json({ error: "Failed to retract membership" }, { status: 500 });
        }

        return NextResponse.json({ message: "Membership retracted successfully" });

    } catch (error) {
        console.error("retract membership error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}