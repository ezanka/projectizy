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
        where: { members: { some: { organization: { slug: organisationSlug } } } },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            members: { select: { role: true } },
        },
    });

    return NextResponse.json(users, { status: 200 });
}