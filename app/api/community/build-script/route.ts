import { generateCommunityIdAndTypeScript } from "@/lib/ckb/xudt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    const { creatorAddress } = body;

    if (!creatorAddress) {
        return NextResponse.json({ error: "Creator address is required" }, { status: 400 });
    }

    const { id, typeScript } = generateCommunityIdAndTypeScript();

    return NextResponse.json({ id, typeScript });
}