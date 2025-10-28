import "server-only";
import { verifyOrg } from "@/src/lib/guards/verifyOrg";

type VerifOrgProps = {
    slug: string;
    allowedRoles?: string[];
    children: React.ReactNode;
};

export default async function VerifOrg({
    slug,
    allowedRoles,
    children,
}: VerifOrgProps) {
    await verifyOrg({ slug, allowedRoles });
    return <>{children}</>;
}
