import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { projectSlug: string };

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
    const { searchParams } = new URL(req.url);
    const { projectSlug } = await params;
    const filename = searchParams.get("filename") ?? "file.bin";
    const user = await getUser();

    if (!user) {
        return NextResponse.error();
    }

    const blob = await put(filename, req.body!, {
        access: "public",
        addRandomSuffix: true,
    });

    const project = await prisma.project.findFirst({
        where: { slug: projectSlug },
        select: { id: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const created = await prisma.file.create({
        data: { ownerId: user.id, projectId: project.id, name: filename, url: blob.url, blobKey: blob.pathname, size: 0, type: blob.contentType, isArchived: false },
    });

    return NextResponse.json(created);
}
