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

        const [creator, members] = await Promise.all([
            supabaseAdmin.from("communities").select("creator_address").eq("id", community_id).eq("creator_address", user_address).maybeSingle(),
            supabaseAdmin.from("members").select("id").eq("community_id", community_id).eq("user_address", user_address).maybeSingle()
        ]);

        if (creator.error) {
            console.log(members.error);
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        }

        if (creator.count) {
            return NextResponse.json({ error: "You can't be a member when you are the creator of this community" }, { status: 400 });
        }

        if (members.error) {
            console.log(members.error);
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        }

        if (members.count) {
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