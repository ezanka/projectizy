import { Metadata } from "next";
import ProfileSettings from "@/src/components/ui/user/settings/profile";
import PreferencesSettings from "@/src/components/ui/user/settings/preferences";
import SecuritySettings from "@/src/components/ui/user/settings/security";
import DangerZone from "@/src/components/ui/user/settings/danger-zone";

export const metadata: Metadata = {
    title: "Paramètres du compte | Projectizy",
    description: "Gérez vos paramètres de compte et préférences",
};

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Paramètres du compte</h1>
                <p className="text-muted-foreground">
                    Gérez vos informations personnelles, vos préférences et la sécurité de votre compte
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile Information */}
                <ProfileSettings />

                {/* Preferences */}
                <PreferencesSettings />

                {/* Security */}
                <SecuritySettings />

                {/* Danger Zone */}
                <DangerZone />
            </div>
        </div>
    );
}
