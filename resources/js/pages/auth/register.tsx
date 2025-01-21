import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/apps/dashboard/paths';

import { RegisterForm } from '@/features/auth/components/register-form';
import { AuthenticationLayout } from '@/components/layout/authentication-layout';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  return (
    <AuthenticationLayout>
      <RegisterForm
        onSuccess={() => {
          navigate(
            `${redirectTo ? `${redirectTo}` : paths.home.getHref()}`,
            {
              replace: true,
            },
          );
        }}
      />
    </AuthenticationLayout>
  );
};
