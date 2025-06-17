import { LoaderFunctionArgs, useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { TeamView } from "@/features/teams/components/team-view";
import { getTeamQueryOptions } from "@/features/teams/api/get-team";
import { QueryClient } from "@tanstack/react-query";

export const teamLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);

    const query = getTeamQueryOptions({ page });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const TeamRoute = () => {
  const { id: teamId } = useParams();

  return (
    <div className="mt-6">
      <TeamView teamId={teamId} />
      <ErrorBoundary fallback={<div>Failed to load the data. Try to refresh the page.</div>}></ErrorBoundary>
    </div>
  );
};
