import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { MemberRole } from "@prisma/client";

type Params = { projectSlug: string };

export async function PATCH(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { name, description, deadline, priority, status } = body ?? {};
        const user = await getUser();
        const { projectSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                project: { slug: projectSlug },
            },
        });

        if (!userRole || (userRole.role !== MemberRole.OWNER && userRole.role !== MemberRole.ADMIN)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const existingProjectName = await prisma.project.findFirst({
            where: {
                name,
                slug: { not: projectSlug },
                members: { some: { userId: user.id } },
            },
        });

        if (existingProjectName) {
            return NextResponse.json({ error: "Un projet avec ce nom existe déjà" }, { status: 409 });
        }

        const project = await prisma.project.findFirst({
            where: { slug: projectSlug },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: { 
                ...(name && { name }),
                ...(description && { description }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(priority && { priority }),
                ...(status && { status }),
            },
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}