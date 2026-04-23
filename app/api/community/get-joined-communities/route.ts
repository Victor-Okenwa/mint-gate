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

    const { data: memberships, error: membersError } = await supabaseAdmin
        .from("members")
        .select("*")
        .range(from, to)
        .eq("user_address", userAddress);

    if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });
    if (!memberships) return NextResponse.json({ communities: [] }, { status: 404 });

    const communities: CommunityListItem[] = [];

    memberships.forEach(async (membership) => {
        console.log(membership);

        const { data, error } = await supabaseAdmin.from("communities").select("*").eq("id", membership.community_id).maybeSingle()

        if (!error && data) {
            communities.push(data);
        }
    });

    console.log(communities, memberships);

    return NextResponse.json({ communities });
}