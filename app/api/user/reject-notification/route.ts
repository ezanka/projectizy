import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id } = body ?? {};
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const notification = await prisma.invitation.updateMany({
            where: {
                id,
            },
            data: {
                status: "rejected",
            },
        });

        return NextResponse.json(notification, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
