import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

export async function GET() {
    const user = await getUser();
    
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.organization.findMany({
        where: {
            members: {
                some: {
                    userId: user.id
                }
            }
        },
        select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            type: true,
        }
    }); 

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json(project, { status: 200 });
}