"use client"

import React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"

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

export const description = "Bar chart des tâches par statut"

const chartConfig = {
    tasks: {
        label: "Tâches",
    },
    todo: {
        label: "À faire",
        color: "var(--chart-1)",
    },
    in_progress: {
        label: "En cours",
        color: "var(--chart-2)",
    },
    review: {
        label: "En revue",
        color: "var(--chart-3)",
    },
    done: {
        label: "Terminées",
        color: "var(--chart-4)",
    },
    blocked: {
        label: "Bloquées",
        color: "var(--chart-5)",
    },
    canceled: {
        label: "Annulées",
        color: "var(--chart-6)",
    },
} satisfies ChartConfig

type ChartPoint = {
    status: keyof typeof chartConfig
    tasks: number
    fill: string
}

export function ChartBarActive({
    projectSlug,
    organisationSlug,
}: {
    projectSlug?: string
    organisationSlug?: string
}) {
    const [chartData, setChartData] = React.useState<ChartPoint[]>([])

    React.useEffect(() => {
        if (!organisationSlug || !projectSlug) return

        const fetchData = async () => {
            try {
                const response = await fetch(
                    `/api/org/${organisationSlug}/project/${projectSlug}/chart`
                )
                if (!response.ok) {
                    console.error("Error fetching chart data:", await response.text())
                    return
                }

                const data = await response.json()
                const task = data.task as {
                    blocked: number
                    canceled: number
                    done: number
                    in_progress: number
                    review: number
                    todo: number
                }

                const formatted: ChartPoint[] = [
                    {
                        status: "todo",
                        tasks: task.todo,
                        fill: "var(--chart-1)",
                    },
                    {
                        status: "in_progress",
                        tasks: task.in_progress,
                        fill: "var(--chart-2)",
                    },
                    {
                        status: "review",
                        tasks: task.review,
                        fill: "var(--chart-3)",
                    },
                    {
                        status: "done",
                        tasks: task.done,
                        fill: "var(--chart-4)",
                    },
                    {
                        status: "blocked",
                        tasks: task.blocked,
                        fill: "var(--chart-5)",
                    },
                    {
                        status: "canceled",
                        tasks: task.canceled,
                        fill: "var(--chart-6)",
                    },
                ]

                setChartData(formatted)
            } catch (error) {
                console.error("Error fetching chart data:", error)
            }
        }

        fetchData()
    }, [organisationSlug, projectSlug])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition des tâches</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="status"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label ?? value
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null

                                const point = payload[0].payload as ChartPoint
                                const statusKey = point.status as keyof typeof chartConfig
                                const statusLabel = chartConfig[statusKey]?.label ?? statusKey

                                return (
                                    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
                                        <div className="font-medium">{statusLabel}</div>
                                        <div className="text-muted-foreground">
                                            {point.tasks} tâche{point.tasks > 1 ? "s" : ""}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                        <Bar
                            dataKey="tasks"
                            strokeWidth={2}
                            radius={8}
                            activeBar={(props: any) => (
                                <Rectangle
                                    {...props}
                                    fillOpacity={0.8}
                                    stroke={props.payload.fill}
                                    strokeDasharray={4}
                                    strokeDashoffset={4}
                                />
                            )}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="text-muted-foreground leading-none">
                    Nombre de tâches par statut sur ce projet
                </div>
            </CardFooter>
        </Card>
    )
}
