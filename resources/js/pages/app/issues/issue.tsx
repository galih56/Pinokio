import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useIssue,
  getIssueQueryOptions,
} from '@/features/issues/api/get-issue';
import { IssueView } from '@/features/issues/components/issue-view';
import { UpdateIssue } from '@/features/issues/components/update-issue';
import { Button } from '@/components/ui/button';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { Edit } from 'lucide-react';

export const issueLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const issueId = params.id as string;

    const issueQuery = getIssueQueryOptions(issueId);
    
    const promises = [
      queryClient.getQueryData(issueQuery.queryKey) ??
        (await queryClient.fetchQuery(issueQuery)),
    ] as const;

    const [issue] = await Promise.all(promises);

    return {
      issue,
    };
};

export const IssueRoute = () => {
  const params = useParams();
  const issueId = params.id;

  return (
    <div className='mt-6'>
        <IssueView issueId={issueId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load comments. Try to refresh the page.</div>
            }
          >
          </ErrorBoundary>
        </div>
    </div>
  );
};
