import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs } from 'react-router-dom';

import { NotFoundRoute } from '@/pages/not-found';
import { FormView } from '@/features/form-guard/components/form-view';
import { RouteErrorFallback } from '@/components/layout/error-fallbacks';
import { getFormTemplateQueryOptions } from '@/features/form-guard/api/use-get-form-template';
import { FormBuilder } from '@/features/form-guard/components/form-builder/form-builder';

export const formLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;

    const formQuery = getFormTemplateQueryOptions(formId);
    
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
        <ErrorBoundary
          FallbackComponent={RouteErrorFallback}
          resetKeys={[formId]} // Reset when formId changes
        >
          <FormBuilder formId={formId} />
        </ErrorBoundary>
    </div>
  );
};
