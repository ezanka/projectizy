
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { MemberRole } from "@prisma/client";

type Params = { organisationSlug: string };

export async function POST(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { userId } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const role = await prisma.member.findFirst({
            where: {
                userId: userId,
                organization: { slug: organisationSlug },
            },
            select: { role: true },
        });

        if (role?.role === MemberRole.OWNER) {
            return NextResponse.json({ error: "Un propriétaire minimum est requis" }, { status: 403 });
        }

        const organization = await prisma.organization.findUnique({
            where: { slug: organisationSlug },
        });

        await prisma.member.deleteMany({
            where: {
                userId,
                organizationId: organization?.id,
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
