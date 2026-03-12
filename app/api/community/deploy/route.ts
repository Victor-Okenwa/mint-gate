import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { communityId, txHash } = await req.json();

        if (!communityId || !txHash) {
            return NextResponse.json({ error: "missing fields" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("communities")
            .update({
                deployment_tx_hash: txHash,
                status: "active",
            })
            .eq("id", communityId)
            .select()
            .single();

        if (error) {
            console.error("update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, community: data });
    } catch (err) {
        console.error("deploy route error:", err);
        return NextResponse.json({ error: "server error" }, { status: 500 });
    }
}