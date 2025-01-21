import { useNavigate, useSearchParams } from 'react-router-dom';

import { paths } from '@/apps/dashboard/paths';
import { LoginForm } from '@/features/auth/components/login-form';
import { AuthenticationLayout } from '@/components/layout/authentication-layout';

export const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <AuthenticationLayout>
      <LoginForm
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
