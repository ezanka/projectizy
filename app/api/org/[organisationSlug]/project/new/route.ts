import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type Params = { organisationSlug: string };

export async function POST(
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

        function generateSlug(length: number = 20): string {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let result = ''
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        }

        const slug = generateSlug();

        if (!name) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const created = await prisma.project.create({
            data: {
                name,
                slug,
                workspace: { connect: { slug: organisationSlug } },
                user: { connect: { id: user.id } },
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
