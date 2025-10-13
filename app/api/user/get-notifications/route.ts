
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function GET(
    req: NextRequest,
) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.invitation.findMany({
        where: { 
            email: user.email,
            status: "pending"
        },
        include: {
            organization: true,
        },
    });

    return NextResponse.json(notifications, { status: 200 });
}