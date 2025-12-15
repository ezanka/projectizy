
type Params = { organisationSlug: string; projectSlug: string };

export default async function ProjectLayout({ params, children }: { params: Promise<Params>, children: React.ReactNode }) {
    const { organisationSlug, projectSlug } = await params;

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/org/${organisationSlug}/project/${projectSlug}/verify-members`, { cache: "no-store" });

    return (
        <div>
            {children}
        </div>

    )
}