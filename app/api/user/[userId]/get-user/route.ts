
import { NextResponse } from "next/server";
import { getUser } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";

type Params = { userId: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
    const isConnected = await getUser();

    if (!isConnected) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return NextResponse.json(user, { status: 200 });
}