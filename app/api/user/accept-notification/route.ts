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
                status: "accepted",
            },
        });

        const invitation = await prisma.invitation.findUnique({
            where: {
                id,
            },
        });

        if (!invitation) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }

        const addUserToOrganization = await prisma.member.create({
            data: {
                organizationId: invitation.organizationId,
                userId: user.id,
                role: "member",
            },
        });

        return NextResponse.json(notification, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
