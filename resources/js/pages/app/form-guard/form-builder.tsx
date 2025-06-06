import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import { NotFoundRoute } from '@/pages/not-found';
import { RouteErrorFallback } from '@/components/layout/error-fallbacks';
import { getFormLayoutQueryOptions } from '@/features/form-guard/api/use-get-form-layout';
import { FormBuilder } from '@/features/form-guard/components/form-builder/form-builder';
import { adjustActiveBreadcrumbs } from '@/components/layout/breadcrumbs/breadcrumbs-store';

type LoaderData = {
  formId: string;
  form: any;
};

export const formLayoutLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const formId = params.id as string;
    const formQuery = getFormLayoutQueryOptions(formId);

    const form = await queryClient.ensureQueryData(formQuery)
    
    return {
      formId,
      form,
    };
};

export const FormBuilderRoute = () => {
  const { formId, form } = useLoaderData() as LoaderData;

  adjustActiveBreadcrumbs(`/forms/:id/layout`, `/forms/${formId}/layout`, form?.title, [form])

  if(!formId) {
    return <NotFoundRoute/>
  }

  return (
    <div className="mt-6">
      <ErrorBoundary
        FallbackComponent={RouteErrorFallback}
        resetKeys={[formId]}
      >
        <FormBuilder formId={formId} initialData={form?.data} />
      </ErrorBoundary>
    </div>
  );
};
