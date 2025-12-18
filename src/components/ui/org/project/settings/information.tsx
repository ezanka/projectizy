"use client"

import { Card, CardContent } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import React from "react";
import { Separator } from "@/src/components/ui/shadcn/separator";
import { Button } from "@/src/components/ui/shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/src/components/ui/shadcn/spinner";
import { Project, ProjectMemberRole, ProjectPriority, projectStatus } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shadcn/popover";
import { Calendar } from "../../../shadcn/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shadcn/select";
import Link from "next/link";

export default function ProjectNameSettings({ organisationSlug, projectSlug }: { organisationSlug: string, projectSlug: string }) {

    const [projectInfo, setProjectInfo] = React.useState<Project | null>(null);
    const [name, setName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");

    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [deadline, setDeadline] = React.useState<Date | undefined>(undefined);
    const [open, setOpen] = React.useState(false);

    const [priority, setPriority] = React.useState<ProjectPriority>(ProjectPriority.medium);
    const [statut, setStatut] = React.useState<projectStatus>(projectStatus.TODO);

    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/get-project-info`);
                const data = await response.json();
                setProjectInfo(data);
                setName(data.name);
                setDescription(data.description || "");
                setPriority(data.priority);
                setStatut(data.status);
                setDeadline(data.deadline || undefined);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };

        fetchOrgDetails();

        const checkAuthorization = async () => {
            try {
                setLoadingAuth(true);
                const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/get-project-user`);
                if (response.ok) {
                    const user = await response.json();
                    if (user.id === user.id && (user.userRole === ProjectMemberRole.OWNER || user.userRole === ProjectMemberRole.ADMIN || user.userRole === ProjectMemberRole.EDITOR)) {
                        setAuthorized(true);
                    }
                } else {
                    setAuthorized(false);
                }
            } catch (error) {
                console.error("Error checking authorization:", error);
            } finally {
                setLoadingAuth(false);
            }
        };

        checkAuthorization();
    }, [organisationSlug, projectSlug]);

    const handleSave = async () => {
        try {
            setLoadingSave(true);
            const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, description, deadline, priority, status: statut }),
            });
            if (response.ok) {
                const updatedOrg = await response.json();
                setProjectInfo(updatedOrg);
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Mise à jour réussie</div>
                                <div className="text-sm opacity-90">Le projet a été mis à jour avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
                router.push("/dashboard/organizations");
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX />
                            <div>
                                <div className="font-semibold">Erreur lors de la mise à jour</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
                setLoadingSave(false);
            }
        } catch (error) {
            console.error("Error updating organization:", error);
        }
    };

    return (
        <Card>
            {loadingAuth ? (
                <CardContent className="flex items-center justify-center">
                    <p className="flex items-center gap-2"><Spinner /> Vérification des autorisations...</p>
                </CardContent>
            ) : (
                authorized ? (
                    <>
                        <CardContent className="flex flex-col gap-4">
                            <div>
                                <p className="mb-2">Nom du projet</p>
                                <Input placeholder="Nom du projet" value={name} onChange={(e) => setName(e.target.value)} className="w-full" disabled={loadingSave} />
                            </div>
                            <div>
                                <p className="mb-2">Description du projet</p>
                                <Input placeholder="Description du projet" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" disabled={loadingSave} />
                            </div>
                            <div className="flex justify-between gap-4 flex-wrap">
                                <div className="flex-1">
                                    <p className="mb-2">Date de fin</p>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="date"
                                                className="justify-between font-normal w-full min-w-50"
                                                disabled={loadingSave || !authorized}
                                            >
                                                {deadline ? new Date(deadline).toLocaleDateString() : "Selectionner la date de fin"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setDate(date)
                                                    setOpen(false)
                                                    setDeadline(date)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex-1">
                                    <p className="mb-2">Priorité</p>
                                    <Select value={priority} onValueChange={(value) => setPriority(value as ProjectPriority)} disabled={loadingSave || !authorized}>
                                        <SelectTrigger id="priority" className="w-full min-w-50">
                                            <SelectValue placeholder="Priorité" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(ProjectPriority).map((priority) => (
                                                <SelectItem key={priority} value={priority} className="capitalize">
                                                    {priority === ProjectPriority.low ? "Faible" :
                                                        priority === ProjectPriority.medium ? "Moyenne" :
                                                            priority === ProjectPriority.high ? "Élevée" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <p className="mb-2">Statut</p>
                                    <Select value={statut} onValueChange={(value) => setStatut(value as projectStatus)} disabled={loadingSave || !authorized}>
                                        <SelectTrigger id="statut" className="w-full min-w-50">
                                            <SelectValue placeholder="Statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(projectStatus).map((status) => (
                                                <SelectItem key={status} value={status} className="capitalize">
                                                    {status === projectStatus.TODO ? "À faire" :
                                                        status === projectStatus.inProgress ? "En cours" :
                                                            status === projectStatus.done ? "Terminé" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardContent className="flex items-center justify-end gap-2">
                            <Button onClick={() => { setName(projectInfo?.name || ""); }} variant={"outline"} disabled={loadingSave} asChild>
                                <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}`}>
                                    Annuler
                                </Link>
                            </Button>
                            <Button onClick={handleSave} disabled={name === projectInfo?.name && description === projectInfo?.description && priority === projectInfo?.priority && statut === projectInfo?.status && deadline== projectInfo?.dueDate?.toLocaleDateString() || loadingSave}>
                                {loadingSave ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Enregistrement en cours...
                                    </span>
                                ) : (
                                    "Enregistrer les modifications"
                                )}
                            </Button>
                        </CardContent>
                    </>

                ) : (
                    <CardContent>
                        <p className="text-red-500">Vous n&apos;êtes pas autorisé à modifier les paramètres de ce projet.</p>
                    </CardContent>
                )
            )}

        </Card>
    )
}