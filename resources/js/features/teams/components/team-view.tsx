import { Spinner } from "@/components/ui/spinner";
import { useTeam } from "../api/get-team";
import DialogOrDrawer from "@/components/layout/dialog-or-drawer";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import UpdateTeam from "@/features/teams/components/update-team";

export const TeamView = ({ teamId }: { teamId: string | undefined }) => {
  if (!teamId) {
    return <h1>Unrecognized Request</h1>;
  }

  const teamQuery = useTeam({
    teamId,
  });

  if (teamQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const team = teamQuery?.data?.data;
  if (!team) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      {/* Edit Team Button */}
      <DialogOrDrawer
        title="Edit Team"
        trigger={
          <Button variant="outline">
            <Edit /> Edit Team
          </Button>
        }
      >
        <UpdateTeam data={team} />
      </DialogOrDrawer>

      {/* Team Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Name</p>
            <p className="text-sm text-muted-foreground">{team.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
