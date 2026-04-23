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

    const payload = communities.map((row) => {
        const id = String(row.id);
        return {
            communityID: id,
            name: row.name ?? "",
            description: row.description ?? "",
            mintPrice: Number(row.mint_price ?? 0),
            creatorAddress: row.creator_address ?? "",
            txHash: row.tx_hash
        };
    });

    return NextResponse.json({ communities: payload });
}