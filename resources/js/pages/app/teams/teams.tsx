import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

import { getTeamsQueryOptions } from '@/features/teams/api/get-teams';
import { TeamsList } from '@/features/teams/components/team-list';
import { lazy } from 'react';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/use-disclosure';
const CreateTeam = lazy(() => import('@/features/teams/components/create-team'));

export const teamsLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);

    const query = getTeamsQueryOptions({ page });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const TeamsRoute = () => {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <>
      <div className="mt-4">
        <DialogOrDrawer 
            open={isOpen}
            onOpenChange={toggle}
            title={"Create Team"}
            trigger={ <Button variant="outline">Create Team</Button>}
            dialogContentClassName="max-w-xs"
          >
            <div className='p-2'>
              <CreateTeam onSuccess={close}/>
            </div>
        </DialogOrDrawer>
        <div className='w-full my-2 p4'>
          <TeamsList />          
        </div>
      </div>
    </>
  );
};
