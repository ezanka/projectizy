"use client";

import React from "react";
import { Skeleton } from "../../shadcn/skeleton";
import { Progress } from "../../shadcn/progress";
import { Task, TaskStatus, TaskPriority, Project, User } from "@prisma/client";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/src/components/ui/shadcn/avatar"
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/shadcn/table"
import { Button } from "@/src/components/ui/shadcn/button";
import { ListPlus } from "lucide-react";

type ProjectDashboardProps = {
    organisationSlug: string;
    projectSlug: string;
};

type ProjectData = {
    project?: Project;
    members?: User[];
    projectStatus?: string;
    tasks?: Task[];
};

export default function ProjectDashboard({ organisationSlug, projectSlug }: ProjectDashboardProps) {
    const [projectData, setProjectData] = React.useState<ProjectData | null>(null);
    const [taskData, setTaskData] = React.useState<Task[] | null>(null);
    const [members, setMembers] = React.useState<User[] | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [progress, setProgress] = React.useState<number>(0);

    const [nextDueTask, setNextDueTask] = React.useState<Date | undefined>(undefined);
    const [delayTaskCount, setDelayTaskCount] = React.useState<number>(0);
    const [todoTaskCount, setTodoTaskCount] = React.useState<number>(0);
    const [inProgressTaskCount, setInProgressTaskCount] = React.useState<number>(0);
    const [reviewTaskCount, setReviewTaskCount] = React.useState<number>(0);
    const [blockedTaskCount, setBlockedTaskCount] = React.useState<number>(0);
    const [doneTaskCount, setDoneTaskCount] = React.useState<number>(0);
    const [urgentTaskCount, setUrgentTaskCount] = React.useState<number>(0);
    const [importantTaskCount, setImportantTaskCount] = React.useState<number>(0);
    const [secondaryTaskCount, setSecondaryTaskCount] = React.useState<number>(0);
    const [totalTaskCount, setTotalTaskCount] = React.useState<number>(0);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/org/${organisationSlug}/project/${projectSlug}/dashboard`
                );

                if (!response.ok) {
                    console.error("Error fetching project dashboard");
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                setProjectData(data);
                setMembers(data.members);

                const tasks = data?.tasks?.filter((task: Task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELED && task.archived === false) || [];
                setTaskData(tasks);

                const todoCount = data?.tasks?.filter((task: Task) => task.status === TaskStatus.TODO).length ?? 0;
                const inProgressCount = data?.tasks?.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS).length ?? 0;
                const reviewCount = data?.tasks?.filter((task: Task) => task.status === TaskStatus.REVIEW).length ?? 0;
                const doneCount = data?.tasks?.filter((task: Task) => task.status === TaskStatus.DONE).length ?? 0;
                const nextDueDateTask = data?.tasks?.filter((task: Task) => task.deadline && new Date(task.deadline) > new Date())[0]?.deadline ?? undefined;
                const delayTask = data?.tasks?.filter((task: Task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.DONE).length ?? 0;
                const blockedCount = data?.tasks?.filter((task: Task) => task.status === TaskStatus.BLOCKED).length ?? 0;
                const urgentCount = data?.tasks?.filter((task: Task) => task.priority === TaskPriority.URGENT).length ?? 0;
                const importantCount = data?.tasks?.filter((task: Task) => task.priority === TaskPriority.HIGH).length ?? 0;
                const secondaryCount = data?.tasks?.filter((task: Task) => task.priority === TaskPriority.MEDIUM).length ?? 0;

                const totalCount = data?.tasks?.length ?? 0;

                setTotalTaskCount(totalCount);
                setDoneTaskCount(doneCount);
                setTodoTaskCount(todoCount);
                setInProgressTaskCount(inProgressCount);
                setReviewTaskCount(reviewCount);
                setNextDueTask(nextDueDateTask);
                setDelayTaskCount(delayTask);
                setBlockedTaskCount(blockedCount);
                setUrgentTaskCount(urgentCount);
                setImportantTaskCount(importantCount);
                setSecondaryTaskCount(secondaryCount);
                setProgress(totalCount > 0 ? (doneCount / totalCount) * 100 : 0);
            } catch (error) {
                console.error("Error in fetchData:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [organisationSlug, projectSlug]);

    return (
        <div className="w-full h-[calc(100vh-8rem)] grid grid-cols-4 grid-rows-4 gap-3">
            <div className="row-start-1 row-end-2 col-start-1 col-end-4 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="flex flex-col w-full h-full justify-between p-4 gap-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="space-y-1">
                            {loading ? (
                                <Skeleton className="h-7 w-40" />
                            ) : (
                                <h2 className="text-lg md:text-xl font-semibold">
                                    {projectData?.project?.name || "Nom du projet"}
                                </h2>
                            )}

                            {loading ? (
                                <Skeleton className="h-4 w-48" />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Statut du projet :{" "}
                                    <span className="font-medium">
                                        {projectData?.projectStatus === TaskStatus.TODO
                                            ? "À faire"
                                            : projectData?.projectStatus === TaskStatus.IN_PROGRESS
                                                ? "En cours"
                                                : projectData?.projectStatus === TaskStatus.REVIEW
                                                    ? "En revue"
                                                    : projectData?.projectStatus === TaskStatus.DONE
                                                        ? "Terminé"
                                                        : projectData?.projectStatus === TaskStatus.BLOCKED
                                                            ? "Bloqué"
                                                            : projectData?.projectStatus === TaskStatus.CANCELED
                                                                ? "Annulé"
                                                                : "Non défini"}
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-1 text-xs md:text-sm text-muted-foreground">
                            {loading ? (
                                <>
                                    <Skeleton className="h-3 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-28" />
                                </>
                            ) : (
                                <>
                                    <span>
                                        Début :{" "}
                                        <span className="font-medium text-foreground">
                                            {projectData?.project?.createdAt
                                                ? new Date(projectData.project.createdAt).toLocaleDateString()
                                                : "Non défini"}
                                        </span>
                                    </span>
                                    <span>
                                        Deadline :{" "}
                                        <span className="font-medium text-foreground">
                                            {projectData?.project?.dueDate
                                                ? new Date(projectData.project.dueDate).toLocaleDateString()
                                                : "Non définie"}
                                        </span>
                                    </span>
                                    <span>
                                        Santé :{" "}
                                        <span className="font-medium text-foreground">
                                            {progress >= 80
                                                ? "En bonne voie"
                                                : progress >= 40
                                                    ? "À surveiller"
                                                    : "Risque de retard"}
                                        </span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <Skeleton className="h-4 w-64 mt-2" />
                    ) : (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="w-full space-y-1">
                                <div className="flex items-center gap-4 w-full">
                                    <Progress value={progress} className="w-full h-3" />
                                    <span className="text-sm text-muted-foreground min-w-fit">
                                        {Math.round(progress)} %
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Progression globale du projet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <div className="row-start-1 row-end-2 col-start-4 col-end-5 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-3 py-2 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Action
                                </p>
                                <h3 className="text-sm font-semibold mt-1">
                                    Actions rapides
                                </h3>
                                <Button asChild className="mt-3 w-full" variant={"outline"}>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks/new`}>
                                        Créer une nouvelle tâche
                                        <ListPlus className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="row-start-2 row-end-3 col-start-1 col-end-2 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-3 py-2 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Résumé rapide
                                </p>
                                <h3 className="text-sm font-semibold mt-1">
                                    Vue d’ensemble du projet
                                </h3>
                            </div>
                            <div className="mt-3 text-xs space-y-1 text-muted-foreground">
                                <p>• Prochaine échéance : {nextDueTask ? new Date(nextDueTask).toLocaleDateString() : "Aucune"}</p>
                                <p>• Tâches en retard : {delayTaskCount}</p>
                                <p>• Tâches bloquées : {blockedTaskCount}</p>
                                <p>• Tâches totales : {totalTaskCount}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="row-start-2 row-end-3 col-start-2 col-end-3 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-3 py-2 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Statuts des tâches
                                </p>
                                <h3 className="text-sm font-semibold mt-1">Répartition globale</h3>
                            </div>
                            <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                                <p>• À faire : {todoTaskCount}</p>
                                <p>• En cours : {inProgressTaskCount}</p>
                                <p>• En revue : {reviewTaskCount}</p>
                                <p>• Terminées : {doneTaskCount}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="row-start-2 row-end-3 col-start-3 col-end-4 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-3 py-2 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Priorité des tâches
                                </p>
                                <h3 className="text-sm font-semibold mt-1">Urgence actuelle</h3>
                            </div>
                            <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                                <p>• Tâches urgentes : {urgentTaskCount}</p>
                                <p>• Tâches importantes : {importantTaskCount}</p>
                                <p>• Tâches secondaires : {secondaryTaskCount}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="row-start-3 row-end-5 col-start-1 col-end-4 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-4 py-3 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Tâches du projet
                                    </p>
                                    <h3 className="text-sm font-semibold">
                                        Liste condensée des tâches
                                    </h3>
                                </div>
                                <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`} className="text-xs underline text-muted-foreground">
                                    Voir toutes les tâches
                                </Link>
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Priorité</TableHead>
                                            <TableHead className="w-[100px]">Titre</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Date limite</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {taskData?.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    {task.priority === TaskPriority.NONE ? <div className="flex items-center gap-2"><div className="w-2 h-2 border rounded-full"></div>Aucune</div> :
                                                        task.priority === TaskPriority.LOW ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-300 rounded-full"></div>Basse</div> :
                                                            task.priority === TaskPriority.MEDIUM ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-400 rounded-full"></div>Moyenne</div> :
                                                                task.priority === TaskPriority.HIGH ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div>Haute</div> :
                                                                    task.priority === TaskPriority.URGENT ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-700 rounded-full"></div>Urgent</div> : ""}
                                                </TableCell>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>
                                                    {task.status === TaskStatus.TODO ? "À faire" :
                                                        task.status === TaskStatus.IN_PROGRESS ? "En cours" :
                                                            task.status === TaskStatus.REVIEW ? "En revue" :
                                                                task.status === TaskStatus.DONE ? "Terminé" :
                                                                    task.status === TaskStatus.BLOCKED ? "Bloqué" :
                                                                        task.status === TaskStatus.CANCELED ? "Annulé" :
                                                                            "Non défini"}
                                                </TableCell>
                                                <TableCell className="text-right">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="row-start-2 row-end-5 col-start-4 col-end-5 bg-accent/40 border flex items-center justify-center rounded-md">
                <div className="w-full h-full px-3 py-3 flex flex-col">
                    {loading ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ) : (

                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                membres
                            </p>
                            <h3 className="text-sm font-semibold mt-1">
                                Participant au projet
                            </h3>
                            <div className="mt-3 text-xs space-y-2 text-muted-foreground overflow-y-scroll">
                                {members && members.length > 0 ? (
                                    members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={member.image ?? undefined} alt={member.name} />
                                                <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <p>{member.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Aucun membre assigné.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
