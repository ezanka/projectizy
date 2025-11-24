"use client"

import React from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/shadcn/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/src/components/ui/shadcn/chart"

export const description = "Tâches terminées cette semaine"

type ChartPoint = {
    day: string
    done: number
}

const chartConfig = {
    done: {
        label: "Tâches terminées",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export default function ChartTaskDoneChartBarActive({
    projectSlug,
    organisationSlug,
}: {
    projectSlug?: string
    organisationSlug?: string
}) {
    const [chartData, setChartData] = React.useState<ChartPoint[]>([])
    const [totalDone, setTotalDone] = React.useState<number>(0)

    React.useEffect(() => {
        if (!organisationSlug || !projectSlug) return

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `/api/org/${organisationSlug}/project/${projectSlug}/chart/done-week`
                )

                const data = await res.json()
                const tasks: { completedAt: string }[] = data.tasks ?? []

                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today)
                    d.setDate(today.getDate() - (6 - i))

                    return {
                        date: d,
                        label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
                        count: 0,
                    }
                })
                
                tasks.forEach((task) => {
                    const completedAt = new Date(task.completedAt)

                    days.forEach((day, idx) => {
                        if (completedAt.toDateString() === day.date.toDateString()) {
                            days[idx].count++
                        }
                    })
                })

                setChartData(
                    days.map((d) => ({
                        day: d.label,
                        done: d.count,
                    }))
                )

                setTotalDone(tasks.length)
            } catch (error) {
                console.error("Error:", error)
                setChartData([])
            }
        }

        fetchData()
    }, [organisationSlug, projectSlug])


    return (
        <Card>
            <CardHeader>
                <CardTitle>Tâches terminées cette semaine</CardTitle>
                <CardDescription>
                    Répartition des tâches en statut <span className="font-semibold">DONE</span> les 7 derniers jours
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="done"
                            type="linear"
                            fill="var(--color-done)"
                            fillOpacity={0.4}
                            stroke="var(--color-done)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            {totalDone} tâche(s) terminée(s) cette semaine
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
