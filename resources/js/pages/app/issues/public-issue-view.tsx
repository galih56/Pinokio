import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  getPublicIssueQueryOptions,
} from '@/features/issues/api/get-public-issue';
import { PublicIssueView } from '@/features/issues/components/public-issue-view';

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

  return (
    <div className='mt-6'>
        <PublicIssueView issueId={issueId} />
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
