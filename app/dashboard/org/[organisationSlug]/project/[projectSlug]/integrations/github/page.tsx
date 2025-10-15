import ProjectIntegrationGithubConfig from "@/src/components/ui/org/project/providers/github/config"
import { prisma } from "@/src/lib/prisma"
import { ProviderName } from "@prisma/client";
import { GitCommit, User, Calendar, ExternalLink } from 'lucide-react';
import Image from "next/image";

type Params = { organisationSlug: string, projectSlug: string };

type Commit = {
    sha: string;
    node_id: string;
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
        if (message.startsWith('feat')) return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Feature' };
        if (message.startsWith('fix')) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Fix' };
        if (message.startsWith('docs')) return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Docs' };
        if (message.startsWith('refactor')) return { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Refactor' };
        if (message.startsWith('test')) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Test' };
        return { color: 'bg-card text-muted-foreground border-muted-foreground', label: 'Commit' };
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
            <div className="bg-accent rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
                    <div className="flex items-center gap-3 text-white">
                        <GitCommit className="w-6 h-6" />
                        <div>
                            <h1 className="text-2xl font-bold">Commits Récents</h1>
                            <p className="text-gray-300 text-sm mt-1">{projectSlug}</p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {githubData.map((commit: Commit, index: number) => {
                        const type = getCommitType(commit.commit.message);
                        const { title, description } = getCommitMessage(commit.commit.message);
                        
                        return (
                            <div 
                                key={commit.sha || index} 
                                className="p-5 hover:bg-accent transition-colors group"
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {commit.author?.avatar_url ? (
                                            <Image 
                                                src={commit.author.avatar_url} 
                                                alt={commit.commit.author.name}
                                                className="w-10 h-10 rounded-full ring-1 ring-purple-800"
                                                width={40}
                                                height={40}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center ring-1">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${type.color} flex-shrink-0`}>
                                                {type.label}
                                            </span>
                                            <h3 className="text-base font-semibold text-white flex-1">
                                                {title}
                                            </h3>
                                        </div>

                                        {description && (
                                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                                {description}
                                            </p>
                                        )}


                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">{commit.commit.author.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(commit.commit.author.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-mono text-xs">
                                                <code className="bg-card border text-white px-2 py-0.5 rounded">
                                                    {commit.sha.substring(0, 7)}
                                                </code>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link */}
                                    {commit.html_url && (
                                        <a 
                                            href={commit.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                {githubData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <GitCommit className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun commit récent</p>
                    </div>
                )}
            </div>
        </div>
    );
}