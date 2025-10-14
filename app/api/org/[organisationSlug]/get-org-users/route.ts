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

    const users = await prisma.user.findMany({
        where: { 
            members: { 
                some: { 
                    organization: { slug: organisationSlug } 
                } 
            } 
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            members: { 
                where: { 
                    organization: { slug: organisationSlug } 
                }, 
                select: { 
                    role: true 
                } 
            },
        },
    });

    const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.members[0]?.role || 'N/A',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
}