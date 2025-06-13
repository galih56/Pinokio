import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import {
  getFormQueryOptions,
} from '@/features/form-guard/api/get-form';
import { NotFoundRoute } from '@/pages/not-found';
import { FormView } from '@/features/form-guard/components/form-view';
import { RouteErrorFallback } from '@/components/layout/error-fallbacks';
import { FormResponses } from '@/features/form-guard/components/form-builder/form-responses';
import { getFormResponsesQueryOptions } from '@/features/form-guard/api/use-get-form-responses';

type LoaderData = {
  formId: string;
  form: any;
};

export const formResponsesLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;
    const formQuery = getFormQueryOptions({ formId });
    const form = await queryClient.ensureQueryData(formQuery)
    const formResponsesQuery = getFormResponsesQueryOptions({ formId });
    const formResponses = await queryClient.ensureQueryData(formResponsesQuery)

    return {
      formId,
      form,
      formResponses,
    };
};

export const FormResponsesRoute = () => {
  const params = useParams();
  const formId = params.id;
  const { form } = useLoaderData() as LoaderData;

  if(!formId) {
    return <NotFoundRoute/>
  }

  return (
    <div className='mt-6'>
        <ErrorBoundary
          FallbackComponent={RouteErrorFallback}
          resetKeys={[formId]} 
        >
          <FormResponses formId={formId} formSections={form.data.sections}/>
        </ErrorBoundary>
    </div>
  );
};
