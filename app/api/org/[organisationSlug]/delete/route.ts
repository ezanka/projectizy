
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function DELETE(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { organisationName } = body ?? {};
        const user = await getUser();
        const { organisationSlug } = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!organisationName) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        await prisma.organization.delete({
            where: { slug: organisationSlug },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
