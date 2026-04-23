import { supabaseAdmin } from "@/lib/superbase/server";
import { CommunityDetail } from "@/utils/constants";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const { data: members, error: membersError } = await supabaseAdmin
        .from("members")
        .select("*")
        .eq("user_address", userAddress);

    console.log(members, membersError);

    return NextResponse.json({ community: members });

    const [membersResult, userMembershipResult] = await Promise.all([
        supabaseAdmin.from("members").select("community_id").eq("community_id", communityId),
        userAddress
            ? supabaseAdmin
                .from("members")
                .select("id")
                .eq("community_id", communityId)
                .eq("user_address", userAddress)
                .maybeSingle()
            : Promise.resolve({ data: null as { id: string } | null, error: null }),
    ]);

    if (membersResult.error) {
        console.error("getCommunity members count:", membersResult.error);
        return NextResponse.json({ error: membersResult.error.message }, { status: 500 });
    }

    if (userMembershipResult.error) {
        console.error("getCommunity membership:", userMembershipResult.error);
        return NextResponse.json({ error: userMembershipResult.error.message }, { status: 500 });
    }

    console.log(userMembershipResult)

    const payload: CommunityDetail = {
        communityID: String(community.id),
        name: community.name ?? "",
        description: community.description ?? "",
        guidelines: Array.isArray(community.guidelines)
            ? community.guidelines.map((item) => String(item))
            : [],
        mintPrice: Number(community.mint_price ?? 0),
        creatorAddress: community.creator_address ?? "",
        hiddenLink: community.hidden_link ?? null,
        txHash: community.tx_hash ?? null,
        isMember: userMembershipResult.data !== null,
        membersCount: membersResult.data?.length ?? 0,
    };

    return NextResponse.json({ community: payload });
}