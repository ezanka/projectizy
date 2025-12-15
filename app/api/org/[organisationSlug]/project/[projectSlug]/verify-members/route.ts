import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { MemberRole, ProjectMemberRole } from "@prisma/client";

type Params = { organisationSlug: string; projectSlug: string };

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const { organisationSlug, projectSlug } = await params;

    const project = await prisma.project.findFirst({
        where: {
        slug: projectSlug,
        workspace: { slug: organisationSlug },
        },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json(
            { error: "Projet introuvable" },
            { status: 404 }
        );
    }

    const orgMembers = await prisma.member.findMany({
        where: { organization: { slug: organisationSlug } },
        select: { userId: true, role: true },
    });

    const projectMembers = await prisma.projectMember.findMany({
        where: { project: { slug: projectSlug } },
        select: { userId: true, projectId: true, role: true },
    });
    
    const projectMemberIds = new Set(projectMembers.map(m => m.userId));

    const missingMembers = orgMembers.filter(
        (m) => !projectMemberIds.has(m.userId)
    );

    await prisma.projectMember.createMany({
        data: missingMembers.map((m) => ({
            userId: m.userId,
            role:
            m.role === MemberRole.ADMIN
                ? ProjectMemberRole.ADMIN
                : m.role === MemberRole.MEMBER
                ? ProjectMemberRole.EDITOR
                : ProjectMemberRole.VIEWER,
            projectId: project.id,
        })),
        skipDuplicates: true,
    });


    return NextResponse.json({ message: "Membres manquants ajouté" }, { status: 200 });
}