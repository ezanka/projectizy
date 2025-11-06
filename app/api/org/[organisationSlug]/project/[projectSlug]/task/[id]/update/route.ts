import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { id: string };

export async function PUT(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { title, status, priority, type, deadline, archived, subTasks } = body ?? {};
        const user = await getUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: { 
                ...(title && { title }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(type && { type }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(typeof archived === "boolean" && { archived }),
                ...(archived && { archivedAt: new Date() }),
                updatedAt: new Date(),
                updatedById: user.id,
            },
        });

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

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}