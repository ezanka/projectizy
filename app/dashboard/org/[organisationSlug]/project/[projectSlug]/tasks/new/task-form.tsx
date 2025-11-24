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
import Link from "next/link"

import React from "react"
import { ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TaskPriority, TaskType, TaskStatus } from "@prisma/client"

export default function NewTaskForm({ organisationSlug, projectSlug }: { organisationSlug: string; projectSlug: string }) {
    const router = useRouter();

    type NewTaskForm = {
        title: string;
        description?: string | null;
        assignedTo?: string | null;
        deadline?: Date | null;
        status?: TaskStatus | undefined;
        priority?: TaskPriority | undefined;
        type?: TaskType | undefined;
    };

    const [formData, setFormData] = React.useState<NewTaskForm>({
        title: "",
        description: "",
        assignedTo: null,
        deadline: null,
        status: undefined,
        priority: undefined,
        type: undefined,
    });

    const [members, setMembers] = React.useState<Array<{ id: string; name: string }>>([]);
    const [loadingMembers, setLoadingMembers] = React.useState<boolean>(true);

    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        try {
            setLoadingMembers(true);
            const fetchMembers = async () => {
                const response = await fetch(`/api/org/${organisationSlug}/get-org-users`);
                const data = await response.json();
                setMembers(data);
            };
            fetchMembers();
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setLoadingMembers(false);
        }
    }, [organisationSlug]);


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        await toast.promise(
            (async () => {
                const res = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/task/new`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Une erreur est survenue lors de la création de la tâche.");
                }

                router.push(`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`);
                return "Tâche créée avec succès.";
            })(),
            {
                loading: "Création de la tâche...",
                success: (msg) => `Tâche créée ! ${msg}`,
                error: (err) => err.message || "Erreur lors de la création de la tâche.",
            }
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Crée une nouvelle tâche</FieldLegend>
                    <FieldDescription>
                        La tâche sera visible par tout les membres du projet.
                    </FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">
                                Titre *
                            </FieldLabel>
                            <Input
                                id="title"
                                placeholder="Tache 1"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
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
                                className="resize-none"
                            />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="assigned-to">
                                    Assigner à
                                </FieldLabel>
                                <Select defaultValue={formData.assignedTo || undefined} onValueChange={(value) => setFormData({ ...formData, assignedTo: value || undefined })}>
                                    <SelectTrigger id="assigned-to">
                                        <SelectValue placeholder="Assigner à un membre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMembers ? (
                                            <SelectItem value="">
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
                                            )))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <div className="flex flex-col gap-3">
                                    <FieldLabel htmlFor="deadline">
                                        Deadline
                                    </FieldLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="w-full justify-between font-normal"
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
                                                    setOpen(false)
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
                                <Select defaultValue={formData.status || undefined} onValueChange={(value) => setFormData({ ...formData, status: value ? (value as TaskStatus) : undefined })}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMembers ? (
                                            <SelectItem value="">
                                                Récupération des membres...
                                            </SelectItem>
                                        ) : (
                                            Object.values(TaskStatus).map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className="capitalize"
                                                >
                                                    {status === TaskStatus.TODO ? "à faire" :
                                                        status === TaskStatus.IN_PROGRESS ? "en cours" :
                                                            status === TaskStatus.REVIEW ? "En revue" :
                                                                status === TaskStatus.BLOCKED ? "Bloqué" :
                                                                    status === TaskStatus.DONE ? "Terminé" :
                                                                        status === TaskStatus.CANCELED ? "Annulé" : ""}
                                                </SelectItem>
                                            )))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="priority">
                                    Priorité
                                </FieldLabel>
                                <Select defaultValue={formData.priority || undefined} onValueChange={(value) => setFormData({ ...formData, priority: value ? (value as TaskPriority) : undefined })}>
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Sélectionner une priorité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMembers ? (
                                            <SelectItem value="">
                                                Récupération des membres...
                                            </SelectItem>
                                        ) : (
                                            Object.values(TaskPriority).map((priority) => (
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
                                            )))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="type">
                                    Type
                                </FieldLabel>
                                <Select defaultValue={formData.type || undefined} onValueChange={(value) => setFormData({ ...formData, type: value ? (value as TaskType) : undefined })}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMembers ? (
                                            <SelectItem value="">
                                                Récupération des membres...
                                            </SelectItem>
                                        ) : (
                                            Object.values(TaskType).map((type) => (
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
                                            )))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <FieldSeparator />
                <Field orientation="horizontal" className="justify-end space-x-2">
                    <Button variant="outline" type="button" asChild>
                        <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`}>
                            Annuler
                        </Link>
                    </Button>
                    <Button type="submit">Créer la tâche</Button>
                </Field>
            </FieldGroup >
        </form >
    )
}
