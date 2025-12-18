
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { projectSlug: string };

export async function DELETE(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { projectName } = body ?? {};
        const user = await getUser();
        const { projectSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!projectName) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const project = await prisma.project.findFirst({
            where: { slug: projectSlug },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (project.name !== projectName) {
            return NextResponse.json({ error: "Le nom du projet ne correspond pas" }, { status: 400 });
        }

        await prisma.project.delete({
            where: { id: project.id },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
