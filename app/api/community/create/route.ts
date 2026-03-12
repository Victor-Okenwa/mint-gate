import { NextResponse } from "next/server"
import { generateCommunityIdAndTypeScript } from "@/lib/ckb/xudt";
import { supabaseAdmin } from "@/lib/superbase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            description,
            guidelines, // frontend should pass an array or newline string
            mint_price,
            creator_address,
        } = body;

        // server generates canonical id + typeScript
        const { id, typeScript } = generateCommunityIdAndTypeScript();

        console.log("body", { name, description, guidelines, mint_price, creator_address, id, typeScript });

        const guidelinesArray =
            typeof guidelines === "string"
                ? guidelines.split("\n").map((s: string) => s.trim()).filter(Boolean)
                : Array.isArray(guidelines)
                    ? guidelines
                    : [];

        const insertRow = {
            id,
            name,
            description,
            guidelines: guidelinesArray,
            mint_price: Number(mint_price ?? 0),
            creator_address,
            type_script: typeScript,
            status: "deploying",
        };

        console.log("insertRow", insertRow);

        const { data, error } = await supabaseAdmin
            .from("communities")
            .insert([insertRow])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // return the created row AND the typeScript so frontend can build tx
        return NextResponse.json({
            community: data,
            typeScript,
        });
    } catch (err) {
        console.error("Create route error:", err);
        return NextResponse.json({ error: "server error" }, { status: 500 });
    }
}