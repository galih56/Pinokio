import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs, useNavigate } from 'react-router-dom';

import {
  getPublicIssueQueryOptions,
} from '@/features/issues/api/get-public-issue';
import { PublicIssueView } from '@/features/issues/components/public-issue-view';
import { Button } from '@/components/ui/button';
import { ListTodoIcon } from 'lucide-react';

export const issueLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const issueId = params.id as string;

    const issueQuery = getPublicIssueQueryOptions(issueId);
    
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
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <>
        <Button variant={'secondary'} onClick={goBack}>
          <ListTodoIcon/>
          Back to The Request List
        </Button>
        <PublicIssueView issueId={issueId} />
        <div className="mt-8">
          <ErrorBoundary
            fallback={
              <div>Failed to load the data. Try to refresh the page.</div>
            }
          >
          </ErrorBoundary>
        </div>
    </>
  );
};
