
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function PATCH(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { userId, role } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!role) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const currentRole = await prisma.member.findFirst({
            where: {
                userId: userId,
                organization: { slug: organisationSlug },
            },
            select: { role: true },
        });

        if (currentRole?.role === "owner") {
            return NextResponse.json({ error: "Vous ne pouvez pas changer le rôle du propriétaire" }, { status: 403 });
        }

        const organization = await prisma.organization.findUnique({
            where: { slug: organisationSlug },
        });

        await prisma.member.updateMany({
            where: {
                userId,
                organizationId: organization?.id,
            },
            data: {
                role
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
