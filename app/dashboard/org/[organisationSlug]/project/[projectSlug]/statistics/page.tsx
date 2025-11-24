
import { ChartBarActive } from "@/src/components/ui/org/project/stats/status-number"
import ChartTaskDone from "@/src/components/ui/org/project/stats/task-done"

type Props = {
    params: {
        organisationSlug: string;
        projectSlug: string;
    }
}

export default async function ProjectStatisticsPage({ params }: Props) {

    const { organisationSlug, projectSlug } = await params;

    return (
        <div className="w-full h-[calc(100vh-8rem)] grid grid-cols-2 grid-rows-2 gap-4">
            <div className="h-full col-start-1 col-end-2 row-start-1 row-end-2">
                <ChartBarActive organisationSlug={organisationSlug} projectSlug={projectSlug} />
            </div>
            <div className="h-full col-start-2 col-end-3 row-start-1 row-end-2">
                <ChartTaskDone organisationSlug={organisationSlug} projectSlug={projectSlug} />
            </div>
            <div className="col-start-1 col-end-4 row-start-2 row-end-3"></div>
        </div>
    )
}