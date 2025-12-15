import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { ProjectMemberRole, MemberRole } from "@prisma/client";

type Params = { organisationSlug: string };

export async function POST(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { name } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orgRole = await prisma.member.findFirst({
            where: { 
                organization: { slug: organisationSlug },
                userId: user.id
            },
        });

        if (orgRole?.role !== MemberRole.OWNER && orgRole?.role !== MemberRole.ADMIN && orgRole?.role !== MemberRole.MEMBER) {
            return NextResponse.json({ error: "Vous n'avez pas la permission de créer un projet dans cette organisation." }, { status: 403 });
        }

        function generateSlug(length: number = 20): string {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let result = ''
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        }

        const slug = generateSlug();

        if (!name) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const created = await prisma.project.create({
            data: {
                name,
                slug,
                workspace: { connect: { slug: organisationSlug } },
                user: { connect: { id: user.id } },
            },
        });

        await prisma.projectMember.create({
            data: {
                userId: user.id,
                projectId: created.id,
                role: ProjectMemberRole.OWNER,
            },
        });

        const orgRoles = await prisma.organization.findMany({
            where: { slug: organisationSlug },
            include: {
                members: {
                    select: { userId: true, role: true },
                },
            },
        });

        for (const member of orgRoles[0]?.members || []) {
            if (member.userId !== user.id) {
                await prisma.projectMember.create({
                    data: {
                        userId: member.userId,
                        projectId: created.id,
                        role: member.role === MemberRole.VIEWER ? ProjectMemberRole.VIEWER : MemberRole.MEMBER ? ProjectMemberRole.EDITOR : MemberRole.ADMIN ? ProjectMemberRole.ADMIN : ProjectMemberRole.VIEWER,
                    },
                });
            }
        }

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
