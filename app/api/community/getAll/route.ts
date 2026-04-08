import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

export type CommunityListItem = {
    communityID: string;
    name: string;
    description: string;
    mintPrice: number;
    isMember: boolean;
    membersCount: number;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit")) || 10));
    const userAddress = (searchParams.get("user_address") ?? "").trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: rows, error: communitiesError } = await supabaseAdmin
        .from("communities")
        .select("id, name, description, mint_price")
        .range(from, to);

    if (communitiesError) {
        console.error("getAll communities:", communitiesError);
        return NextResponse.json({ error: communitiesError.message }, { status: 500 });
    }

    const communities = rows ?? [];
    const ids = communities.map((c) => String(c.id));

    const membersCountByCommunity = new Map<string, number>();
    const membershipIds = new Set<string>();

    if (ids.length > 0) {
        const [allMembersResult, userMembershipResult] = await Promise.all([
            supabaseAdmin.from("members").select("communityid").in("communityid", ids),
            userAddress
                ? supabaseAdmin
                      .from("members")
                      .select("communityid")
                      .eq("user_address", userAddress)
                      .in("communityid", ids)
                : Promise.resolve({ data: null as { communityid: string }[] | null, error: null }),
        ]);

        if (allMembersResult.error) {
            console.error("getAll members counts:", allMembersResult.error);
            return NextResponse.json({ error: allMembersResult.error.message }, { status: 500 });
        }

        for (const m of allMembersResult.data ?? []) {
            const cid = String(m.communityid);
            membersCountByCommunity.set(cid, (membersCountByCommunity.get(cid) ?? 0) + 1);
        }

        if (userAddress) {
            if (userMembershipResult.error) {
                console.error("getAll membership:", userMembershipResult.error);
                return NextResponse.json({ error: userMembershipResult.error.message }, { status: 500 });
            }
            for (const m of userMembershipResult.data ?? []) {
                membershipIds.add(String(m.communityid));
            }
        }
    }

    const payload: CommunityListItem[] = communities.map((row) => {
        const id = String(row.id);
        return {
            communityID: id,
            name: row.name ?? "",
            description: row.description ?? "",
            mintPrice: Number(row.mint_price ?? 0),
            isMember: userAddress ? membershipIds.has(id) : false,
            membersCount: membersCountByCommunity.get(id) ?? 0,
        };
    });

    return NextResponse.json({ communities: payload });
}
