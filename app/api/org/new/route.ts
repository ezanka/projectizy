import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { randomUUID } from "crypto";
import { getUser } from "@/src/lib/auth-server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, type, plan } = body ?? {};
        const user = await getUser();
        
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

        if (!name || !type || !plan) {
            return NextResponse.json({ error: "Des champs sont manquants" }, { status: 400 });
        }

        const created = await prisma.organization.create({
            data: {
                name,
                slug,
                type,
                plan,
                members: {
                    create: { userId: user.id, role: "owner"}
                },
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
