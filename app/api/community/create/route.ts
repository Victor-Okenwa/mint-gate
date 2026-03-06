import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateXudtTransaction } from "@/lib/ckb/xudt";
import { ccc } from "@ckb-ccc/core";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { id, name, description, guidelines, mint_price, creator_address } = body;

        console.log(body)

        const { data, error } = await supabase
            .from("communities")
            .insert([
                {
                    id,
                    name,
                    description,
                    guidelines,
                    mint_price,
                    creator_address,
                    status: "deploying"
                }
            ])
            .select();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        const community = data[0];

        const unsignedTx = await generateXudtTransaction({ creatorAddress: community.creator_address, communityId: community.id, xudtCodeHash: process.env.NEXT_PUBLIC_XUDT_CODE_HASH! });

        const signer = ccc.useSigner();

        const response = await fetch("/api/community/deploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                communityId: community.id,
                unsignedTx: unsignedTx
            })
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to deploy community" },
                { status: 400 }
            )
        }

        // Return unsigned tx to frontend
        return NextResponse.json({
            community,
            unsignedTx
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}