
import { NextResponse } from "next/server";
import { getUser } from "@/src/lib/auth-server";

export async function GET() {
    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });
}