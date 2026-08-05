import type { CommunityListItem } from "@/app/api/community/get-all/route";
import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

const MAX_LIMIT = 6;

/**
 * Returns up to `limit` communities ranked by member count (desc).
 * Communities with zero members are used only to fill remaining slots.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(MAX_LIMIT, Number(searchParams.get("limit")) || MAX_LIMIT));
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const [{ data: memberRows, error: membersError }, { data: communityRows, error: communitiesError }] =
        await Promise.all([
            supabaseAdmin.from("members").select("community_id"),
            supabaseAdmin.from("communities").select("id, name, description, mint_price, creator_address"),
        ]);

    if (membersError) {
        console.error("getTop members:", membersError);
        return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    if (communitiesError) {
        console.error("getTop communities:", communitiesError);
        return NextResponse.json({ error: communitiesError.message }, { status: 500 });
    }

    const communities = communityRows ?? [];
    const communityById = new Map(communities.map((row) => [String(row.id), row]));

    const membersCountByCommunity = new Map<string, number>();
    for (const m of memberRows ?? []) {
        const cid = String(m.community_id);
        if (!communityById.has(cid)) continue;
        membersCountByCommunity.set(cid, (membersCountByCommunity.get(cid) ?? 0) + 1);
    }

    const rankedIds = [...communityById.keys()].sort((a, b) => {
        const diff = (membersCountByCommunity.get(b) ?? 0) - (membersCountByCommunity.get(a) ?? 0);
        if (diff !== 0) return diff;
        return a.localeCompare(b);
    });

    const topIds = rankedIds.slice(0, limit);

    const membershipIds = new Set<string>();
    if (userAddress && topIds.length > 0) {
        const { data: userMemberships, error: membershipError } = await supabaseAdmin
            .from("members")
            .select("community_id")
            .eq("user_address", userAddress)
            .in("community_id", topIds);

        if (membershipError) {
            console.error("getTop membership:", membershipError);
            return NextResponse.json({ error: membershipError.message }, { status: 500 });
        }

        for (const m of userMemberships ?? []) {
            membershipIds.add(String(m.community_id));
        }
    }

    const payload: CommunityListItem[] = topIds.map((id) => {
        const row = communityById.get(id)!;
        return {
            communityID: id,
            name: row.name ?? "",
            description: row.description ?? "",
            mintPrice: Number(row.mint_price ?? 0),
            creatorAddress: row.creator_address ?? "",
            isCreator: Boolean(userAddress) && row.creator_address === userAddress,
            isMember: membershipIds.has(id),
            membersCount: membersCountByCommunity.get(id) ?? 0,
        };
    });

    return NextResponse.json({ communities: payload });
}
