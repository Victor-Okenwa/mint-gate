import { NextResponse } from "next/server";

import { isValidStoredHiddenLink } from "@/lib/hidden-link";
import { db } from "@/lib/db";
import { communities } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      name,
      description,
      guidelines,
      mint_price,
      hidden_link,
      creator_address,
      tx_hash,
    } = body;

    const guidelinesArray =
      typeof guidelines === "string"
        ? guidelines
            .split("\n")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : Array.isArray(guidelines)
          ? guidelines
          : [];

    if (hidden_link != null && typeof hidden_link !== "string") {
      return NextResponse.json({ error: "Invalid hidden link URL" }, { status: 400 });
    }
    if (typeof hidden_link === "string" && !isValidStoredHiddenLink(hidden_link)) {
      return NextResponse.json({ error: "Invalid hidden link URL" }, { status: 400 });
    }

    const [data] = await db
      .insert(communities)
      .values({
        id,
        name,
        description: description ?? "",
        guidelines: guidelinesArray,
        mintPrice: String(Number(mint_price ?? 0)),
        hiddenLink: hidden_link ?? null,
        creatorAddress: creator_address,
        txHash: tx_hash ?? null,
      })
      .returning();

    return NextResponse.json({
      community: data,
    });
  } catch (err) {
    console.error("Create route error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Server call failed" },
      { status: 500 },
    );
  }
}
