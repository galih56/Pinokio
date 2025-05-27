import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import {
  getFormQueryOptions,
} from '@/features/form-guard/api/get-form';
import { FormView } from '@/features/form-guard/components/form-view';
import { NotFoundRoute } from '@/pages/not-found';

export const formLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;

    const formQuery = getFormQueryOptions(formId);
    
    const promises = [
      queryClient.getQueryData(formQuery.queryKey) ??
        (await queryClient.fetchQuery(formQuery)),
    ] as const;

    const [form] = await Promise.all(promises);

    return {
      form,
    };
};

export const FormRoute = () => {
  const params = useParams();
  const formId = params.id;

  if(!formId) {
    return <NotFoundRoute/>
  }

  return (
    <div className='mt-6'>
        <FormView formId={formId} />
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
