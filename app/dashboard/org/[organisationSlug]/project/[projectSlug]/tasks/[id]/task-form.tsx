"use client"

import { Button } from "@/src/components/ui/shadcn/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/src/components/ui/shadcn/field"
import { Input } from "@/src/components/ui/shadcn/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/shadcn/select"
import { Textarea } from "@/src/components/ui/shadcn/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/shadcn/popover"
import { Calendar } from "@/src/components/ui/shadcn/calendar"
import { Checkbox } from "@/src/components/ui/shadcn/checkbox"
import Link from "next/link"

import React from "react"
import { ChevronDownIcon, GripVertical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TaskPriority, TaskType, TaskStatus, SubTask } from "@prisma/client"
import { Label } from "@/src/components/ui/shadcn/label"
import { Progress } from "@/src/components/ui/shadcn/progress"
import { ReactSortable } from "react-sortablejs";
import { Spinner } from "@/src/components/ui/shadcn/spinner"

export default function DetailsTaskForm({ organisationSlug, projectSlug, id }: { organisationSlug: string; projectSlug: string; id: string }) {
    const router = useRouter();

    type TaskForm = {
        title: string;
        description?: string | null;
        assignedTo?: string | null;
        deadline?: Date | null;
        status?: TaskStatus | undefined;
        priority?: TaskPriority | undefined;
        type?: TaskType | undefined;
    };

    const [formData, setFormData] = React.useState<TaskForm>({
        title: "",
        description: "",
        assignedTo: null,
        deadline: null,
        status: undefined,
        priority: undefined,
        type: undefined,
    });

    const [subTasks, setSubTasks] = React.useState<Array<SubTask>>([]);
    const [subTaskTitle, setSubTaskTitle] = React.useState<string>("");

    const [members, setMembers] = React.useState<Array<{ id: string; name: string }>>([]);
    const [loadingMembers, setLoadingMembers] = React.useState<boolean>(true);
    const [loadingTask, setLoadingTask] = React.useState<boolean>(true);

    React.useEffect(() => {
        try {
            setLoadingMembers(true);
            const fetchMembers = async () => {
                const response = await fetch(`/api/org/${organisationSlug}/get-org-users`);
                const data = await response.json();
                setMembers(data);
                setLoadingMembers(false);
            };
            fetchMembers();
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    }, [organisationSlug]);

    React.useEffect(() => {
        try {
            setLoadingTask(true);
            const fetchTaskDetails = async () => {
                const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/task/${id}/get`);
                const data = await response.json();
                setFormData({
                    title: data.task.title,
                    description: data.task.description,
                    assignedTo: data.task.assignedTo,
                    deadline: data.task.deadline ? new Date(data.task.deadline) : null,
                    status: data.task.status,
                    priority: data.task.priority,
                    type: data.task.type,
                });
                setSubTasks(
                    (data.subTasks ?? [])
                        .slice()
                        .sort((a: SubTask, b: SubTask) => {
                            if (a.done !== b.done) return a.done ? 1 : -1;
                            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                        })
                );
                setLoadingTask(false);
            };

            fetchTaskDetails();
        } catch (error) {
            console.error("Failed to fetch task details:", error);
        }
    }, [organisationSlug, projectSlug, id]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        await toast.promise(
            (async () => {
                const res = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/task/${id}/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ formData, subTasks }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Une erreur est survenue lors de la sauvegarde de la tâche.");
                }

                router.push(`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`);
                return "Tâche mise à jour avec succès.";
            })(),
            {
                loading: "Mise à jour de la tâche...",
                success: (msg) => `Tâche mise à jour ! ${msg}`,
                error: (err) => err.message || "Erreur lors de la mise à jour de la tâche.",
            }
        );
    }

    async function handleSubTaskDelete(targetId: string): Promise<void> {
        setSubTasks((prev) => prev.filter((st) => st.id !== targetId));

        const subTaskSelected = subTasks.find((st) => st.id === targetId)!;

        const res = await fetch(
            `/api/org/${organisationSlug}/project/${projectSlug}/task/${id}/subtask/${subTaskSelected.id}/delete`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!res.ok) {
            setSubTasks(subTasks);
            const data = await res.json().catch(() => ({}));
            toast.error(data.error ?? "Impossible de supprimer la sous-tâche.");
        }
    }

    async function handleSubTaskChange(targetId: string): Promise<void> {
        const next = subTasks
            .map((st) => (st.id === targetId ? {
                ...st,
                done: !st.done,
                doneAt: !st.done ? new Date() : null
            } : st))
            .sort((a, b) => {
                if (a.done === b.done) return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
                return a.done ? 1 : -1;
            })
            .map((st, idx) => ({ ...st, orderIndex: idx }));

        setSubTasks(next);

        const updated = next.find((st) => st.id === targetId)!;

        const res = await fetch(
            `/api/org/${organisationSlug}/project/${projectSlug}/task/${id}/subtask/${updated.id}/update`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            }
        );

        if (!res.ok) {
            setSubTasks(subTasks);
            const data = await res.json().catch(() => ({}));
            toast.error(data.error ?? "Impossible de mettre à jour la sous-tâche.");
        }
    }

    async function handleAddSubTask(): Promise<void> {
        const nextIndex = subTasks.length;

        const tempId = crypto.randomUUID();
        const newSubTask: SubTask = {
            id: tempId,
            title: subTaskTitle,
            done: false,
            taskId: id,
            orderIndex: nextIndex,
            doneAt: null,
        };

        setSubTasks((prev) => [...prev, newSubTask]);
        setSubTaskTitle("");

        try {
            const res = await fetch(
                `/api/org/${organisationSlug}/project/${projectSlug}/task/${id}/subtask/new`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSubTask),
                }
            );

            if (!res.ok) throw new Error("Erreur lors de la création");

            const data = await res.json();

            setSubTasks((prev) =>
                prev.map((s) =>
                    s.id === tempId ? { ...s, id: data.id } : s
                )
            );
        } catch (error) {
            console.error(error);
            setSubTasks((prev) => prev.filter((s) => s.id !== tempId));
        }

        setSubTaskTitle("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Détails de la tâche</FieldLegend>
                    <FieldDescription>
                        La tâche est visible par tout les membres du projet.
                    </FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">
                                Titre
                            </FieldLabel>
                            <Input
                                id="title"
                                placeholder="Tache 1"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                disabled={loadingTask}
                                required
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="description">
                                Description
                            </FieldLabel>
                            <Textarea
                                id="description"
                                placeholder="Description de la tache"
                                value={formData.description || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                disabled={loadingTask}
                                className="resize-none"
                            />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="assigned-to">
                                    Assigner à
                                </FieldLabel>
                                <Select value={formData.assignedTo || undefined} onValueChange={(value) => setFormData({ ...formData, assignedTo: value || undefined })} disabled={loadingMembers}>
                                    <SelectTrigger id="assigned-to" disabled={loadingMembers}>
                                        <SelectValue placeholder="Assigner à un membre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMembers ? (
                                            <SelectItem value="Aucun">
                                                Récupération des membres...
                                            </SelectItem>
                                        ) : (
                                            members.map((member) => (
                                                <SelectItem
                                                    key={member.id}
                                                    value={member.id}
                                                >
                                                    {member.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <div className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="deadline">
                                        Deadline
                                    </FieldLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="w-full justify-between font-normal"
                                                disabled={loadingTask}
                                            >
                                                {formData.deadline ? formData.deadline.toLocaleDateString() : "Selectionner une date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.deadline || undefined}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setFormData({ ...formData, deadline: date || undefined })
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field>
                                <FieldLabel htmlFor="status">
                                    Statut
                                </FieldLabel>
                                <Select value={formData.status || undefined} onValueChange={(value) => setFormData({ ...formData, status: value ? (value as TaskStatus) : undefined })} disabled={loadingTask}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(TaskStatus).map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className="capitalize"
                                                >
                                                    {status === TaskStatus.TODO ? "À faire" :
                                                        status === TaskStatus.IN_PROGRESS ? "En cours" :
                                                            status === TaskStatus.REVIEW ? "À revoir" :
                                                                status === TaskStatus.BLOCKED ? "Bloqué" :
                                                                    status === TaskStatus.DONE ? "Terminé" :
                                                                        status === TaskStatus.CANCELED ? "Annulé" : ""}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="priority">
                                    Priorité
                                </FieldLabel>
                                <Select value={formData.priority || undefined} onValueChange={(value) => setFormData({ ...formData, priority: value ? (value as TaskPriority) : undefined })} disabled={loadingTask}>
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Sélectionner une priorité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                            {Object.values(TaskPriority).map((priority) => (
                                                <SelectItem
                                                    key={priority}
                                                    value={priority}
                                                    className="capitalize"
                                                >
                                                    {priority === TaskPriority.NONE ? "Aucune" :
                                                        priority === TaskPriority.LOW ? "Basse" :
                                                            priority === TaskPriority.MEDIUM ? "Moyenne" :
                                                                priority === TaskPriority.HIGH ? "Haute" :
                                                                    priority === TaskPriority.URGENT ? "Urgent" : ""}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="type">
                                    Type
                                </FieldLabel>
                                <Select value={formData.type || undefined} onValueChange={(value) => setFormData({ ...formData, type: value ? (value as TaskType) : undefined })} disabled={loadingTask}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(TaskType).map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className="capitalize"
                                                >
                                                    {type === TaskType.TASK ? "Tâche" :
                                                        type === TaskType.BUG ? "Bug" :
                                                            type === TaskType.FEATURE ? "Fonctionnalité" :
                                                                type === TaskType.CHORE ? "Nettoyage" : ""}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                {!loadingTask ? (
                    <>
                        <FieldSeparator />
                        <Field>
                            <FieldLegend>Sous-tâches</FieldLegend>
                            {subTasks.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center">Aucune sous-tâche.</p>
                            ) : (
                                <>
                                    <div className="flex items-center gap-6">
                                        <Progress value={subTasks.filter((task) => task.done).length / subTasks.length * 100} />
                                        <p className="text-input min-w-fit">{(subTasks.filter((task) => task.done).length / subTasks.length * 100).toFixed(0)} %</p>
                                    </div>
                                    <FieldDescription>
                                        {subTasks.filter((task) => task.done).length} sur {subTasks.length} sous-tâches terminées
                                    </FieldDescription>
                                    <div className="mt-4 space-y-2">

                                        <ReactSortable
                                            list={subTasks}
                                            setList={(newOrder: SubTask[]) => {
                                                const reindexed = newOrder.map((st, idx) => ({ ...st, orderIndex: idx }));
                                                setSubTasks(reindexed);
                                            }}
                                            className="space-y-2"
                                        >
                                            {subTasks.map((subTask) => (
                                                <div className="w-full flex items-center justify-between gap-3 bg-accent px-2 py-1 rounded-md border" key={subTask.id}>
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="cursor-grab" />
                                                        <Checkbox
                                                            id={`subtask-${subTask.id}`}
                                                            checked={subTask.done}
                                                            onCheckedChange={() => handleSubTaskChange(subTask.id)}
                                                        />
                                                        <Label
                                                            htmlFor={`subtask-${subTask.id}`}
                                                            className={subTask.done ? "line-through text-gray-500" : ""}
                                                        >
                                                            {subTask.title}
                                                        </Label>
                                                    </div>
                                                    <Button asChild variant="ghost" type="button" className="text-primary/80 hover:text-primary hover:cursor-pointer" onClick={() => handleSubTaskDelete(subTask.id)}>
                                                        <Trash2 width={96} height={96} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </ReactSortable>
                                    </div>
                                </>
                            )
                            }
                        </Field>
                        <Field>
                            <FieldLegend>Ajouter une sous-tâche</FieldLegend>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="title"
                                    placeholder="Sous tâche"
                                    value={subTaskTitle}
                                    onChange={(e) =>
                                        setSubTaskTitle(e.target.value)
                                    }
                                />
                                <Button type="button" disabled={!subTaskTitle} onClick={handleAddSubTask}>
                                    Ajouter une sous-tâche
                                </Button>
                            </div>
                        </Field>
                    </>
                ) : (
                    <>
                        <FieldSeparator />
                        <div className="flex items-center justify-center w-full gap-4">
                            <Spinner />
                            <p>Chargement des sous-tâches...</p>
                        </div>
                    </>
                )}
                <FieldSeparator />
                <Field orientation="horizontal" className="justify-end space-x-2">
                    <Button variant="outline" type="button" asChild>
                        <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`}>
                            Annuler
                        </Link>
                    </Button>
                    <Button type="submit" disabled={loadingTask}>Sauvegarder la tâche</Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
