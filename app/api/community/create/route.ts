import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/superbase/server";

function isValidHiddenLink(url: unknown): boolean {
    if (url == null || url === "") return true;
    if (typeof url !== "string") return false;
    const trimmed = url.trim();
    if (!trimmed) return true;
    try {
        const u = new URL(trimmed);
        return u.protocol === "https:" && Boolean(u.hostname);
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            id,
            name,
            description,
            guidelines, // frontend should pass an array or newline string
            mint_price,
            hidden_link,
            creator_address,
            tx_hash,
        } = body;

        // console.log("body", { name, description, guidelines, mint_price, creator_address, id, typeScript, txHash });

        const guidelinesArray =
            typeof guidelines === "string"
                ? guidelines.split("\n").map((s: string) => s.trim()).filter(Boolean)
                : Array.isArray(guidelines)
                    ? guidelines
                    : [];

        if (!isValidHiddenLink(hidden_link)) {
            return NextResponse.json({ error: "Invalid hidden link URL" }, { status: 400 });
        }

        const insertRow = {
            id,
            name,
            description,
            guidelines: guidelinesArray,
            mint_price: Number(mint_price ?? 0),
            hidden_link,
            creator_address,
            tx_hash,
        };

        console.log("insertRow", insertRow);

        const { data, error } = await supabaseAdmin
            .from("communities")
            .insert([insertRow])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: (error as Error).message ?? "Server error" }, { status: 500 });
        }

        return NextResponse.json({
            community: data,
        });
    } catch (err) {
        console.error("Create route error:", err);
        return NextResponse.json({ error: (err as Error).message ?? "Server call failed" }, { status: 500 });
    }
}