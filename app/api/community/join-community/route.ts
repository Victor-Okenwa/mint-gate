import { supabaseAdmin } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            community_id,
            user_address,
            tx_hash,
        } = body;

        const isMember = await supabaseAdmin.from("members").select("*").eq("community_id", community_id).eq("user_address", user_address).single();

        if (isMember) {
            return NextResponse.json({ error: "You are already a member of this community" }, { status: 400 });
        }

        const community = await supabaseAdmin.from("communities").select("*").eq("id", community_id).single();

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }

        const { error } = await supabaseAdmin.from("members").insert([{
            community_id,
            user_address,
            tx_hash,
        }]).select()
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to join community" }, { status: 500 });
        }

        return NextResponse.json({ message: "Joined community successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}