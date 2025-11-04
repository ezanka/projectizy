import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";
import { getUser } from "@/src/lib/auth-server";

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
        where: { slug: projectSlug },
        select: { id: true }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const files = await prisma.file.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        take: 50
    });
    
    return NextResponse.json(files);
}
