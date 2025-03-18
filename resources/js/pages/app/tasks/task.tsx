import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  useTask,
  getTaskQueryOptions,
} from '@/features/tasks/api/get-task';
import { TaskView } from '@/features/tasks/components/task-view';
import { NotFoundRoute } from '@/pages/not-found';

export const taskLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const taskId = params.id as string;

    const taskQuery = getTaskQueryOptions(taskId);
    
    const promises = [
      queryClient.getQueryData(taskQuery.queryKey) ??
        (await queryClient.fetchQuery(taskQuery)),
    ] as const;

    const [task] = await Promise.all(promises);

    return {
      task,
    };
};

export const TaskRoute = () => {
  const params = useParams();
  const taskId = params.id;

  if(!taskId) {
    return <NotFoundRoute/>
  }

  return (
    <div className='mt-6'>
        <TaskView taskId={taskId} />
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
