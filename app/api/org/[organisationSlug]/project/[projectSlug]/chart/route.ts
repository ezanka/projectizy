import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { TaskStatus } from "@prisma/client";

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
        where: { slug: projectSlug }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
    });

    const task = tasks.reduce((acc, curr) => {
        if (curr.status === TaskStatus.BLOCKED) {
            acc.blocked += 1;
        } else if (curr.status === TaskStatus.CANCELED) {
            acc.canceled += 1;
        } else if (curr.status === TaskStatus.DONE) {
            acc.done += 1;
        } else if (curr.status === TaskStatus.IN_PROGRESS) {
            acc.in_progress += 1;
        } else if (curr.status === TaskStatus.REVIEW) {
            acc.review += 1;
        } else if (curr.status === TaskStatus.TODO) {
            acc.todo += 1;
        }
        return acc;
    }, { blocked: 0, canceled: 0, done: 0, in_progress: 0, review: 0, todo: 0 });

    return NextResponse.json({ task }, { status: 200 });
}