import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { id: string, subTaskId: string };

export async function PUT(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { title, done, orderIndex, doneAt } = body ?? {};
        const user = await getUser();
        const { id, subTaskId } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedSubTask = await prisma.subTask.update({
            where: { id: subTaskId },
            data: { 
                ...(title && { title }),
                ...(typeof done === "boolean" && { done }),
                ...(typeof orderIndex === "number" && { orderIndex }),
                ...(done ? { doneAt: doneAt ? new Date(doneAt) : new Date() } : { doneAt: null }),
            },
        });

        await prisma.task.update({
            where: { id: id },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedSubTask, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}