import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    const user = await getUser();
    const { organisationSlug } = await params;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
        where: { workspaceSlug: organisationSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            description: true,
            startDate: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(projects, { status: 200 });
}