"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import { Label } from "@/src/components/ui/shadcn/label";
import React from "react";
import { Settings } from "lucide-react";
import { Switch } from "@/src/components/ui/shadcn/switch";

export default function PreferencesSettings() {
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [projectUpdates, setProjectUpdates] = React.useState(true);
    const [taskAssignments, setTaskAssignments] = React.useState(true);
    const [weeklyDigest, setWeeklyDigest] = React.useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Préférences de notifications
                </CardTitle>
                <CardDescription>
                    Configurez vos préférences de notifications par email
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base">
                            Notifications par email
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir des notifications par email pour les activités importantes
                        </p>
                    </div>
                    <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                    />
                </div>

                <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                        <Label htmlFor="project-updates" className="text-base">
                            Mises à jour de projet
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Notifications lors de changements dans vos projets
                        </p>
                    </div>
                    <Switch
                        id="project-updates"
                        checked={projectUpdates}
                        onCheckedChange={setProjectUpdates}
                        disabled={!emailNotifications}
                    />
                </div>

                <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                        <Label htmlFor="task-assignments" className="text-base">
                            Assignations de tâches
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir une notification lorsqu&apos;une tâche vous est assignée
                        </p>
                    </div>
                    <Switch
                        id="task-assignments"
                        checked={taskAssignments}
                        onCheckedChange={setTaskAssignments}
                        disabled={!emailNotifications}
                    />
                </div>

                <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                        <Label htmlFor="weekly-digest" className="text-base">
                            Résumé hebdomadaire
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Recevoir un résumé hebdomadaire de vos projets et tâches
                        </p>
                    </div>
                    <Switch
                        id="weekly-digest"
                        checked={weeklyDigest}
                        onCheckedChange={setWeeklyDigest}
                        disabled={!emailNotifications}
                    />
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 mt-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Note :</strong> Les préférences de notifications seront disponibles prochainement.
                        Cette interface est en cours de développement.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
