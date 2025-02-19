import ActivityLog from "@/components/layout/activity-log";
import { useIssueLogs } from "../api/get-issue-logs";
import { Skeleton } from "@/components/ui/skeleton";

type IssueLogProps = {
    issueId: string;
    page?: number;
    perPage?: number;
    search?: string;
};
  
export default function IssueLog({
    issueId,
    page = 1,
    perPage = 15,
    search,
}: IssueLogProps) {
    const { data, isLoading, isError, error } = useIssueLogs({
        issueId,
        page,
        perPage,
        search,
    });

    if (isLoading) return (
        <Skeleton className="w-full min-h-[60vh]" />
    );
    if (isError) return <p>Error: {(error as Error).message}</p>;
    
    return <ActivityLog logData={data?.data || []} />;
}