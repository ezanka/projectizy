import { NextResponse } from "next/server";
import { getUser } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Récupérer toutes les sessions actives de l'utilisateur
        const sessions = await prisma.session.findMany({
            where: {
                userId: user.id,
                expiresAt: {
                    gt: new Date(), // Seulement les sessions non expirées
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des sessions" },
            { status: 500 }
        );
    }
}
