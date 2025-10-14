
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
        const { name } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!name) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const checkDoublon = await prisma.organization.findMany({
            where: { 
                name,
                members: { some: { userId: user.id } }
            },
        });

        if (checkDoublon.length > 0) {
            return NextResponse.json({ error: "Une organisation avec ce nom existe déjà" }, { status: 409 });
        }

        await prisma.organization.update({
            where: { slug: organisationSlug },
            data: { name },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
