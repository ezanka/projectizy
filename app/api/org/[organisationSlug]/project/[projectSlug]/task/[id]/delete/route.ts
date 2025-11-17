import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { id: string };

export async function DELETE(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const user = await getUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deletedTask = await prisma.task.delete({
            where: { 
                id: id,
            },
        });

        return NextResponse.json(deletedTask, { status: 200 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}