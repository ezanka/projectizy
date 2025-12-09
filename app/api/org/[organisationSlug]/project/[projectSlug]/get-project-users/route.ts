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

    const users = await prisma.user.findMany({
        where: { 
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

    const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.projectMembers[0]?.role || 'N/A',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
}