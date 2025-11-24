import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { TaskStatus } from "@prisma/client";

type Params = { id: string };

export async function PUT(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { title, description, assignedTo, deadline, status, priority, type, archived, subTasks } = body ?? {};
        const user = await getUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: { 
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(assignedTo !== undefined && { assignedTo }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(status && { status }),
                ...(status === TaskStatus.DONE ? { completedAt: new Date() } : {}),
                ...(priority && { priority }),
                ...(type && { type }),
                ...(typeof archived === "boolean" && { archived }),
                ...(archived && { archivedAt: new Date() }),
                updatedAt: new Date(),
                updatedById: user.id,
            },
        });

        if (subTasks && Array.isArray(subTasks)) {
            await Promise.all(
                subTasks.map(async (subTask: { id: string; title: string; done: boolean }) => {
                    return await prisma.subTask.upsert({
                        where: { id: subTask.id },
                        update: {
                            title: subTask.title,
                            done: subTask.done,
                        },
                        create: {
                            id: subTask.id,
                            title: subTask.title,
                            done: subTask.done,
                            taskId: id,
                        },
                    });
                })
            );
        }

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}