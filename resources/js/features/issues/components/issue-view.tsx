

import { Spinner } from '@/components/ui/spinner';
import { useIssue } from '../api/get-issue';

export const IssueView = ({ issueId }: { issueId: string | undefined }) => {
  
  if(!issueId){
    return <h1>Unrecognized Request</h1>
  }
  
  const issueQuery = useIssue({
    issueId,
  });

  if (issueQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const issue = issueQuery?.data?.data;
  if (!issue) return null;

  return (
    <div className="mt-6 flex flex-col px-6 space-y-2">
      <div className="grid grid-cols-2 gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Name</p>
              <p className="text-sm text-muted-foreground">
                {issue.name} 
                <br />
                {issue.code ?? <span className='text-red'>No Issue Code Found</span>}
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};
