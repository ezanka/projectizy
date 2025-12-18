"use client"

import { Card, CardContent } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import React from "react";
import { Button } from "@/src/components/ui/shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/src/components/ui/shadcn/spinner";
import { ProjectMemberRole } from "@prisma/client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/shadcn/dialog";
import { TriangleAlert } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/shadcn/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    projectName: z.string().min(1, "Le nom de l'organisation est requis"),
});

export default function ProjectDeleteSettings({ organisationSlug, projectSlug }: { organisationSlug: string, projectSlug: string }) {

    const [projectName, setProjectName] = React.useState<string>("");

    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);
    const [loadingDelete, setLoadingDelete] = React.useState(false);

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/get-project-info`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                setProjectName(data.name);
            } catch (error) {
                console.error("Error fetching organization details:", error);
            }
        };

        fetchOrgDetails();

        const checkAuthorization = async () => {
            try {
                setLoadingAuth(true);
                const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/get-project-user`);
                if (response.ok) {
                    const user = await response.json();
                    if (user.userRole === ProjectMemberRole.OWNER || user.userRole === ProjectMemberRole.ADMIN) {
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

    const handleDelete = async () => {
        try {
            setLoadingDelete(true);
            const response = await fetch(`/api/org/${organisationSlug}/project/${projectSlug}/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ projectName: projectName }),
            });
            if (response.ok) {
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Suppression réussie</div>
                                <div className="text-sm opacity-90">Le projet a été supprimé avec succès.</div>
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
                                <div className="font-semibold">Erreur lors de la suppression</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
                setLoadingDelete(false);
            }
        } catch (error) {
            console.error("Error updating organization name:", error);
        }
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
        },
    })

    const watchedProjectName = form.watch("projectName");

    if (loadingAuth && !authorized) {
        return null;
    }

    return (
        <>
            {authorized && (
                <Card className="border-red-800 bg-red-900/10">
                    {loadingAuth ? (
                        <CardContent className="flex items-center justify-center">
                            <p className="flex items-center gap-2"><Spinner /> Vérification des autorisations...</p>
                        </CardContent>
                    ) : (
                        authorized && (
                            <>
                                <CardContent className="flex flex-col gap-4">
                                    <p className="font-semibold text-primary">La suppression de ce projet supprimera également votre base de données.</p>
                                    <p className="text-muted-foreground">Assurez-vous d&apos;avoir effectué une sauvegarde si vous souhaitez conserver vos données</p>
                                    <div className="flex items-center justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button type="button" className="border-red-800 bg-red-900/50 text-white hover:bg-red-900/70 hover:border-red-900">
                                                    Supprimer le projet
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-[425px]">
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(handleDelete)}>
                                                        <DialogHeader>
                                                            <DialogTitle>Confirmer la suppression du projet</DialogTitle>
                                                            <div className="flex items-center text-center gap-2 bg-accent px-4 py-2 rounded-md">
                                                                <span className="text-red-500"><TriangleAlert /></span>
                                                                <p>Cette action est irréversible.</p>
                                                            </div>
                                                            <DialogDescription className="mb-2">
                                                                Assurez-vous d&apos;avoir effectué une sauvegarde si vous souhaitez conserver vos données.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="grid gap-4 mb-4">
                                                            <div className="grid gap-3">
                                                                <FormField
                                                                    control={form.control}
                                                                    name="projectName"
                                                                    disabled={loadingDelete}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>
                                                                                Taper <span className="font-black">&apos;{projectName}&apos;</span> pour confirmer
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Taper le nom du projet" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button type="button" variant="outline" disabled={loadingDelete}>Annuler</Button>
                                                            </DialogClose>
                                                            <Button type="submit" disabled={loadingDelete || watchedProjectName !== projectName} variant="destructive">
                                                                {loadingDelete ? (
                                                                    <span className="inline-flex items-center gap-2">
                                                                        <Spinner className="h-4 w-4" /> Suppression en cours...
                                                                    </span>
                                                                ) : (
                                                                    "Supprimer le projet"
                                                                )}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </>

                        )
                    )}

                </Card>
            )}

        </>
    )
}