import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
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

    const userData = await prisma.user.findUnique({
        where: { 
            id: user.id,
            projectMembers: { 
                some: { 
                    project: { slug: projectSlug } 
                } 
            } 
        },
        include: {
            projectMembers: {
                where: { project: { slug: projectSlug } },
            }
        }
    });

    return NextResponse.json(userData, { status: 200 });
}