import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { communityId, unsignedTx } = await req.json();

        const txHash = await broadcastTransaction();
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}