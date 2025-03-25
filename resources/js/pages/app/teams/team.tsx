import { useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { TeamView } from "@/features/teams/components/team-view";

export const TeamRoute = () => {
  const { id: teamId } = useParams();

  return (
    <div className="mt-6">
      <TeamView teamId={teamId} />
      <ErrorBoundary fallback={<div>Failed to load the data. Try to refresh the page.</div>}></ErrorBoundary>
    </div>
  );
};
