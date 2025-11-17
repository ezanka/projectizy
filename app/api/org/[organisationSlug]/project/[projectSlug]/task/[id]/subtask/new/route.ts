

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { id: string };

export async function POST(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { title, done, orderIndex, doneAt } = body ?? {};
        const user = await getUser();
        const { id } = await params;
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const created = await prisma.subTask.create({
            data: {
                taskId: id,
                title: title,
                done: done || false,
                orderIndex: orderIndex || 0,
                doneAt: doneAt ? new Date(doneAt) : null,
            },
        });

        await prisma.task.update({
            where: { id: id },
            data: {
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
