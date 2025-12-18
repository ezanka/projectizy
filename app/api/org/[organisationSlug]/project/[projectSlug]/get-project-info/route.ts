

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { projectSlug: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
    const user = await getUser();
    const { projectSlug } = await params; 

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
        where: {
            slug: projectSlug,
            members: {
                some: {
                    userId: user.id
                }
            }
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(project, { status: 200 });
}