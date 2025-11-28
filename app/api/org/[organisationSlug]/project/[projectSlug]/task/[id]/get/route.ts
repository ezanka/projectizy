import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { projectSlug: string, id: string };

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const user = await getUser();
    const { projectSlug, id } = await params;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
        where: { 
            id: id,
            project: { slug: projectSlug }
        },
        include: { taskMembers: true },
    });

    const subTasks = await prisma.subTask.findMany({
        where: { 
            taskId: id,
        },
    });

    return NextResponse.json({ task, subTasks }, { status: 200 });
}