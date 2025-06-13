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
import { useBreadcrumbSync } from '@/components/layout/breadcrumbs/breadcrumbs-store';
import { getFormLayoutQueryOptions } from '@/features/form-guard/api/use-get-form-layout';

type LoaderData = {
  formId: string;
  form: any;
  formResponses: any;
};

export const formResponsesLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;
    const formQuery = getFormLayoutQueryOptions(formId);
    const form = await queryClient.ensureQueryData(formQuery)
    const formResponsesQuery = getFormResponsesQueryOptions(formId);
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
  const { form, formResponses } = useLoaderData() as LoaderData;

  useBreadcrumbSync(`/forms/:id`, `/forms/${formId}`, form?.data?.title, [form]);
  useBreadcrumbSync(`/forms/:id/responses`, `/forms/${formId}/responses`, 'Responses', [])

  if(!formId) {
    return <NotFoundRoute/>
  }

  return (
    <div className='mt-6'>
        <ErrorBoundary
          FallbackComponent={RouteErrorFallback}
          resetKeys={[formId]} 
        >
          <FormResponses formId={formId} formSections={form.data?.sections} initialData={formResponses}/>
        </ErrorBoundary>
    </div>
  );
};
