import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";
import { CommunityListItem } from "../get-all/route";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get all memberships for the user, paged
    const { data: memberships, error: membersError } = await supabaseAdmin
        .from("members")
        .select("*")
        .range(from, to)
        .eq("user_address", userAddress);

    if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });
    if (!memberships || memberships.length === 0) return NextResponse.json({ communities: [] }, { status: 200 });

    // Get the community IDs to fetch details for
    const communityIds = memberships.map((m) => m.community_id);

    // If no memberships, return empty list
    if (!communityIds.length) {
        return NextResponse.json({ communities: [] }, { status: 200 });
    }

    // Fetch all communities in one query using `in`
    const { data: communityRows, error: communitiesError } = await supabaseAdmin
        .from("communities")
        .select("*")
        .in("id", communityIds);

    if (communitiesError) return NextResponse.json({ error: communitiesError.message }, { status: 500 });

    // Optionally: Make sure the order matches the order of communityIds (to preserve pagination relevance)
    let communities = [];
    if (communityRows) {
        // Could filter/map if needed to ensure order
        const communityMap = Object.fromEntries(communityRows.map((row) => [row.id, row]));
        communities = communityIds.map((cid) => communityMap[cid]).filter(Boolean);
    }


    const payload: CommunityListItem[] = communities.map((row) => {
        const id = String(row.id);
        return {
            communityID: id,
            name: row.name ?? "",
            description: row.description ?? "",
            mintPrice: Number(row.mint_price ?? 0),
            creatorAddress: row.creator_address ?? "",
            isCreator: row.creator_address == userAddress,
            isMember: true,
        };
    });

    return NextResponse.json({ communities: payload });
}