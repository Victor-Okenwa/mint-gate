import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get all memberships for the user, paged
    const { data: communities, error } = await supabaseAdmin
        .from("communities")
        .select("*")
        .range(from, to)
        .eq("creator_address", userAddress);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!communities || communities.length === 0) return NextResponse.json({ communities: [] }, { status: 200 });

    const ids = communities.map((c) => String(c.id));

    const membersCountByCommunity = new Map<string, number>();
    const membershipIds = new Set<string>();

    if (ids.length > 0) {
        const [allMembersResult, userMembershipResult] = await Promise.all([
            supabaseAdmin.from("members").select("community_id").in("community_id", ids),
            userAddress
                ? supabaseAdmin
                    .from("members")
                    .select("community_id")
                    .eq("user_address", userAddress)
                    .in("community_id", ids)
                : Promise.resolve({ data: null as { community_id: string }[] | null, error: null }),
        ]);

        if (allMembersResult.error) {
            console.error("getAll members counts:", allMembersResult.error);
            return NextResponse.json({ error: allMembersResult.error.message }, { status: 500 });
        }

        for (const m of allMembersResult.data ?? []) {
            const cid = String(m.community_id);
            membersCountByCommunity.set(cid, (membersCountByCommunity.get(cid) ?? 0) + 1);
        }

        console.log(allMembersResult)

        if (userAddress) {
            if (userMembershipResult.error) {
                console.error("getAll membership:", userMembershipResult.error);
                return NextResponse.json({ error: userMembershipResult.error.message }, { status: 500 });
            }
            for (const m of userMembershipResult.data ?? []) {
                membershipIds.add(String(m.community_id));
            }
        }
    }

    const payload = communities.map((row) => {
        const id = String(row.id);
        return {
            communityID: id,
            name: row.name ?? "",
            description: row.description ?? "",
            mintPrice: Number(row.mint_price ?? 0),
            creatorAddress: row.creator_address ?? "",
            isCreator: true,
            isMember: false,
            membersCount: membersCountByCommunity.get(id) ?? 0,
            txHash: row.tx_hash
        };
    });

    return NextResponse.json({ communities: payload });
}