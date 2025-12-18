import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
    name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
    email: z.string().email("Email invalide"),
});

export async function PATCH(request: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        if (validatedData.email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (existingUser && existingUser.id !== user.id) {
                return NextResponse.json(
                    { error: "Cet email est déjà utilisé" },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: validatedData.name,
                email: validatedData.email,
            },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de l'utilisateur" },
            { status: 500 }
        );
    }
}
