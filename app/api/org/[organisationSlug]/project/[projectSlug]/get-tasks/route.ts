import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { projectSlug: string };

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const user = await getUser();
    const { projectSlug } = await params;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
        where: { slug: projectSlug },
        select: { id: true }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
        select: {
            id: true,
            title: true,
            description: true,
            projectId: true,
            assignedTo: true,
            deadline: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(tasks, { status: 200 });
}