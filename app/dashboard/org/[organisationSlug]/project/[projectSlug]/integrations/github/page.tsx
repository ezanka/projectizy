import ProjectIntegrationGithubConfig from "@/src/components/ui/org/project/providers/github/config"
import { prisma } from "@/src/lib/prisma"
import { ProviderName } from "@prisma/client";
import { GitCommit, User, Calendar, ExternalLink, FolderGit } from 'lucide-react';
import Image from "next/image";
import { Button } from "@/src/components/ui/shadcn/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/shadcn/empty"
import Link from "next/link";

type Params = { organisationSlug: string, projectSlug: string };

type Commit = {
    sha: string;
    node_id: string;
    message: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: null | string;
            payload: null | string;
            verified_at: null | string;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    } | null;
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        user_view_type: string;
        site_admin: boolean;
    } | null;
    parents: Array<{
        sha: string;
        url: string;
        html_url: string;
    }>;
};

export default async function ProjectIntegrationGithubPage({ params }: { params: Params }) {

    const { organisationSlug, projectSlug } = await params;

    const project = await prisma.project.findFirst({
        where: { slug: projectSlug },
        select: { id: true },
    })

    const githubProject = await prisma.provider.findFirst({
        where: {
            projectId: project?.id,
            name: ProviderName.github,
        },
    })

    if (!githubProject) {
        return <ProjectIntegrationGithubConfig organisationSlug={organisationSlug} projectSlug={projectSlug} />
    }

    const githubData = await fetch(githubProject.url).then(res => res.json())

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;

        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getCommitType = (message: string) => {
        if (message.startsWith('feat')) return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Feature', icon: <GitCommit className="w-3.5 h-3.5" /> };
        if (message.startsWith('fix')) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Fix', icon: <GitCommit className="w-3.5 h-3.5" /> };
        if (message.startsWith('docs')) return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Docs', icon: <GitCommit className="w-3.5 h-3.5" /> };
        if (message.startsWith('refactor')) return { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Refactor', icon: <GitCommit className="w-3.5 h-3.5" /> };
        if (message.startsWith('test')) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Test', icon: <GitCommit className="w-3.5 h-3.5" /> };
        return { color: 'bg-card text-muted-foreground border-muted-foreground', label: 'Commit', icon: <GitCommit className="w-3.5 h-3.5" /> };
    };

    const getCommitMessage = (message: string) => {
        const lines = message.split('\n');
        return {
            title: lines[0].replace(/^(feat|fix|docs|refactor|test|chore|style|perf|ci|build):\s*/, ''),
            description: lines.slice(2).join('\n').trim()
        };
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 mb-2">
                    <div className="flex items-center gap-3 text-white">
                        <GitCommit className="w-6 h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Commits Récents</h1>
                            <p className="text-gray-300 text-sm mt-1">{projectSlug}</p>
                        </div>
                    </div>
                </div>

                {githubData.message === "Not Found" ? (
                    <div className="bg-card border rounded-xl p-12 text-center">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FolderGit />
                                </EmptyMedia>
                                <EmptyTitle>Repository introuvable</EmptyTitle>
                                <EmptyDescription>
                                    Vérifiez que le propriétaire et le nom du dépôt sont corrects.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <div className="flex gap-2">
                                    <Button asChild>
                                        <Link href="https://github.com/new">Créer un repository <ExternalLink className="w-4 h-4 ml-1" /></Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/github/config`}>Reconfigurer</Link>
                                    </Button>
                                </div>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    githubData.length > 0 ? (
                        <div className="space-y-3">
                            {githubData.map((commit: Commit, index: number) => {
                                const type = getCommitType(commit.commit.message);
                                const { title, description } = getCommitMessage(commit.commit.message);

                                return (
                                    <div
                                        key={commit.sha || index}
                                        className="group bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                {commit.author?.avatar_url ? (
                                                    <div className="relative">
                                                        <Image
                                                            src={commit.author.avatar_url}
                                                            alt={commit.commit.author.name}
                                                            className="w-11 h-11 rounded-full ring-2 ring-border group-hover:ring-primary/30 transition-all"
                                                            width={44}
                                                            height={44}
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />
                                                    </div>
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                                                        <User className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-start gap-3 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${type.color} flex-shrink-0`}>
                                                        <span>{type.icon}</span>
                                                        {type.label}
                                                    </span>
                                                    <h3 className="text-base font-semibold text-foreground leading-tight flex-1 min-w-0">
                                                        {title}
                                                    </h3>
                                                </div>

                                                {description && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed pl-0.5">
                                                        {description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span>{commit.commit.author.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(commit.commit.author.date)}</span>
                                                    </div>
                                                    <code className="inline-flex items-center gap-1.5 bg-muted/50 border px-2 py-1 rounded-md font-mono">
                                                        <GitCommit className="w-3 h-3" />
                                                        {commit.sha.substring(0, 7)}
                                                    </code>
                                                </div>
                                            </div>

                                            {commit.html_url && (
                                                <Link
                                                    href={commit.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                                    aria-label="Voir sur GitHub"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-card border rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GitCommit className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Aucun commit récent
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Les commits apparaîtront ici une fois disponibles
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}