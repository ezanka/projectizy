import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string; projectSlug: string };

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const user = await getUser();
    const { organisationSlug, projectSlug } = await params;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
        where: { slug: projectSlug }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const organisation = await prisma.organization.findFirst({
        where: { slug: organisationSlug }
    });

    if (!organisation) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const members = await prisma.member.findMany({
        where: {
            organizationId: organisation.id,
        },
    });

    const membersInfo = await prisma.user.findMany({
        where: {
            id: { in: members.map(member => member.userId) },
        },
    });

    const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
    });

    return NextResponse.json({ project, projectStatus: project.status, tasks, members: membersInfo }, { status: 200 });
}