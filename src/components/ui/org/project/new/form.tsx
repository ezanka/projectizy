"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/shadcn/form"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/shadcn/card"
import { Input } from "@/src/components/ui/shadcn/input"
import { Button } from "@/src/components/ui/shadcn/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/src/components/ui/shadcn/spinner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Le nom doit comporter au moins 2 caractères.",
    }),
})

export function NewProjectForm({ organisationSlug }: { organisationSlug: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            fetch(`/api/org/${organisationSlug}/project/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            }).then(async (res) => {
                if (res.ok) {
                    const project = await res.json()
                    router.push(`/dashboard/org/${organisationSlug}/project/${project.slug}`)
                } else {
                    console.error("Erreur lors de la création du projet")
                }
            })
        } catch (error) {
            console.error("Erreur lors de la création du projet", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full bg-accent">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <CardHeader className="border-b mt-2">
                        <CardTitle>Créer un nouveau projet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom du projet" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Quel est le nom de votre projet ?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                        <Button type="submit" variant={"outline"}>
                            <Link href="/dashboard/organizations">
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Spinner />}
                            Créer le projet
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>

    )
}