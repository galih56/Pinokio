import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useTeam,
  getTeamQueryOptions,
} from '@/features/teams/api/get-team';
import { TeamView } from '@/features/teams/components/team-view';
import { UpdateTeam } from '@/features/teams/components/update-team';
import { Button } from '@/components/ui/button';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Edit } from 'lucide-react';

export const teamLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const teamId = params.id as string;

    const teamQuery = getTeamQueryOptions(teamId);
    
    const promises = [
      queryClient.getQueryData(teamQuery.queryKey) ??
        (await queryClient.fetchQuery(teamQuery)),
    ] as const;

    const [team] = await Promise.all(promises);

    return {
      team,
    };
};

export const TeamRoute = () => {
  const params = useParams();
  const teamId = params.id;

  return (
    <div className='mt-6'>
        {
          teamId && 
          <DialogOrDrawer 
            title={"Edit Team"}
            description={"Pastikan data yang anda masukan sudah benar sesuai!"}
            trigger={ <Button variant="outline"> <Edit/> Edit Team</Button>}
            >
              <UpdateTeam teamId={teamId}/>
          </DialogOrDrawer>}
        <TeamView teamId={teamId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load the data. Try to refresh the page.</div>
            }
          >
          </ErrorBoundary>
        </div>
    </div>
  );
};
