import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

import { getIssuesQueryOptions } from '@/features/issues/api/get-issues';
import { IssuesList } from '@/features/issues/components/issue-list';
import { lazy } from 'react';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/use-disclosure';
import CreateIssue from '@/features/issues/components/create-issue';

export const issuesLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);

    const query = getIssuesQueryOptions({ page });

    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const IssuesRoute = () => {
  const { isOpen, open, close, toggle } = useDisclosure();

  return (
    <>
      <div className="mt-4">
        <DialogOrDrawer 
          open={isOpen}
          onOpenChange={toggle}
          title={"Create Issue"}
          trigger={ <Button variant="outline">Create Issue</Button>}
          >
            <CreateIssue onSuccess={close}/>
        </DialogOrDrawer>
        <div className='w-full my-2 p4'>
          <IssuesList />          
        </div>
      </div>
    </>
  );
};
