import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import {
  getFormQueryOptions,
} from '@/features/form-guard/api/get-form';
import { NotFoundRoute } from '@/pages/not-found';
import { FormView } from '@/features/form-guard/components/form-view';
import { RouteErrorFallback } from '@/components/layout/error-fallbacks';

type LoaderData = {
  formId: string;
  form: any;
};

export const formLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;
    const formQuery = getFormQueryOptions(formId);

    const form = await queryClient.ensureQueryData(formQuery)

    return {
      formId,
      form,
    };
};

export const FormRoute = () => {
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
          <FormView formId={formId} initialData={form.data}/>
        </ErrorBoundary>
    </div>
  );
};
