"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/shadcn/card"
import { Button } from "@/src/components/ui/shadcn/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/shadcn/form"
import { Input } from "@/src/components/ui/shadcn/input"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useRouter } from "next/navigation"
import { Spinner } from "@/src/components/ui/shadcn/spinner";
import React from "react";

const formSchema = z.object({
    owner: z.string().min(2).max(50),
    repository: z.string().min(2).max(100),
    projectSlug: z.string().optional(),
})

export default function ProjectIntegrationGithubConfig({ organisationSlug, projectSlug, providerUrl }: { organisationSlug: string, projectSlug: string, providerUrl: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            owner: providerUrl.split('/').slice(-3, -2)[0] || "",
            repository: providerUrl.split('/').slice(-2, -1)[0] || "",
            projectSlug: projectSlug,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!providerUrl) {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/org/${organisationSlug}/project/provider/config/github`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    console.error('API error', res.status, data);
                    throw new Error(`${res.status} - ${data?.error ?? 'Unknown error'}`);
                }

                router.refresh();
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
                router.push(`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/github`);
            }
        } else {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/org/${organisationSlug}/project/provider/config/github`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    console.error('API error', res.status, data);
                    throw new Error(`${res.status} - ${data?.error ?? 'Unknown error'}`);
                }

                router.refresh();
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
                router.push(`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/github`);
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>GitHub Integration</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="owner"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Owner</FormLabel>
                                    <FormControl>
                                        <Input placeholder="username" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Quel est le nom du propriétaire du dépôt ?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repository"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Repository</FormLabel>
                                    <FormControl>
                                        <Input placeholder="repository" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Quel est le nom du dépôt ?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Spinner /><span>Configuration en cours...</span></> : "Configurer le dépôt"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}