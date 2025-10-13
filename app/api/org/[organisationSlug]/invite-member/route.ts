import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function POST(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { email } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const userToInvite = await prisma.user.findUnique({
            where: { email },
        });

        if (!userToInvite) {
            return NextResponse.json({ error: "L'utilisateur que vous essayez d'inviter n'existe pas" }, { status: 404 });
        }

        const organization = await prisma.organization.findUnique({
            where: { slug: organisationSlug },
        });
        
        if (!organization) {
            return NextResponse.json({ error: "Organisation non trouvée" }, { status: 404 });
        }

        const isMember = await prisma.member.findFirst({
            where: {
                userId: userToInvite?.id,
                organizationId: organization.id,
            },
        });

        if (isMember) {
            return NextResponse.json({ error: "Le membre est déjà dans l'organisation" }, { status: 403 });
        }

        const existingInvitation = await prisma.invitation.findFirst({
            where: {
                email,
                organizationId: organization.id,
                status: "pending",
            },
        });

        if (existingInvitation) {
            return NextResponse.json({ error: "Une invitation a déjà été envoyée à cet utilisateur" }, { status: 409 });
        }

        const organizationId = organization.id;

        const created = await prisma.invitation.create({
            data: {
                organizationId,
                role: "member",
                email,
                status: "pending",
                inviterId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
