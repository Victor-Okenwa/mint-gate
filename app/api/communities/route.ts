import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
console.log(body)
        const { data, error } = await supabase
            .from("communities")
            .insert([body])
            .select()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(data[0])
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}