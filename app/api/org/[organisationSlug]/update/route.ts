import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function PATCH(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { name, type } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = await prisma.member.findFirst({
            where: {
                userId: user.id,
                organization: { slug: organisationSlug },
            },
        });

        if (!userRole || (userRole.role !== "owner" && userRole.role !== "admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const existingOrg = await prisma.organization.findFirst({
            where: {
                name,
                slug: { not: organisationSlug },
                members: { some: { userId: user.id } },
            },
        });

        if (existingOrg) {
            return NextResponse.json({ error: "Une organisation avec ce nom existe déjà" }, { status: 409 });
        }

        const updatedOrg = await prisma.organization.update({
            where: { slug: organisationSlug },
            data: { 
                ...(name && { name }),
                ...(type && { type }),
            },
        });

        return NextResponse.json(updatedOrg, { status: 200 });
    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}