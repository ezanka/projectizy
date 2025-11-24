import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { TaskStatus } from "@prisma/client"

type Params = {
  organisationSlug: string
  projectSlug: string
}

function getLast7DaysRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  return { start, end }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { organisationSlug, projectSlug } = await params
    const { start, end } = getLast7DaysRange()

    const tasks = await prisma.task.findMany({
      where: {
        status: TaskStatus.DONE,
        project: {
          slug: projectSlug,
        },
        completedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { completedAt: "asc" },
    })

    return NextResponse.json({ start, end, tasks })
  } catch (error) {
    console.error("Error fetching last 7 days DONE tasks:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
