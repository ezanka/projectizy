import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

export async function POST(
    req: Request,
) {
    try {
        const body = await req.json();
        const { owner, repository, projectSlug } = body;
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!owner || !repository || !projectSlug) {
            return NextResponse.json(
                { error: "Des champs sont manquants" },
                { status: 400 }
            );
        }

        const project = await prisma.project.findFirst({
            where: { slug: projectSlug },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Projet introuvable" },
                { status: 404 }
            );
        }

        const configProvider = await prisma.provider.create({
            data: {
                name: "github",
                projectId: project.id,
                url: `https://api.github.com/repos/${owner}/${repository}/commits`,
            },
        });

        return NextResponse.json(configProvider, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Erreur lors de la création du provider",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
) {
    try {
        const body = await req.json();
        const { owner, repository, projectSlug } = body;
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!owner || !repository || !projectSlug) {
            return NextResponse.json(
                { error: "Des champs sont manquants" },
                { status: 400 }
            );
        }

        const project = await prisma.project.findFirst({
            where: { slug: projectSlug },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Projet introuvable" },
                { status: 404 }
            );
        }

        const existingProvider = await prisma.provider.findFirst({
            where: {
                projectId: project.id,
                name: "github",
            },
        });

        if (!existingProvider) {
            return NextResponse.json(
                { error: "Provider introuvable" },
                { status: 404 }
            );
        }

        const configProvider = await prisma.provider.update({
            where: {
                id: existingProvider.id,
            },
            data: {
                url: `https://api.github.com/repos/${owner}/${repository}/commits`,
            },
        });

        return NextResponse.json(configProvider, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Erreur lors de la création du provider",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
