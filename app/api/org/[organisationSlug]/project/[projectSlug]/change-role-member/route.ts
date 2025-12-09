
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { ProjectMemberRole } from "@prisma/client";

type Params = { projectSlug: string };

export async function PATCH(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { userId, role } = body ?? {};
        const user = await getUser();
        const { projectSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!role) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const currentRole = await prisma.projectMember.findFirst({
            where: {
                userId: userId,
                project: { slug: projectSlug },
            },
            select: { role: true },
        });

        if (currentRole?.role === ProjectMemberRole.OWNER) {
            return NextResponse.json({ error: "Vous ne pouvez pas changer le rôle du propriétaire" }, { status: 403 });
        }

        const project = await prisma.project.findFirst({
            where: { slug: projectSlug },
        });

        await prisma.projectMember.updateMany({
            where: {
                userId,
                projectId: project?.id
            },
            data: {
                role
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
