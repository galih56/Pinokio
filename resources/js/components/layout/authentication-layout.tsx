import * as React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Head } from '@/components/seo';
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import logo from '@/assets/logo-with-label.png';
import useAuth from '@/store/useAuth';

type LayoutProps = {
  children: React.ReactNode;
};

export const AuthenticationLayout = ({ children }: LayoutProps) => {
  const user = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  
  useEffect(() => {
    if (user.authenticated) {
       window.location.href = paths.home.getHref()
    }
  }, [
    user.authenticated, 
    redirectTo
  ]);

    return (
    <>
      <Head title={'Pinokio'} />
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md bg-white shadow rounded-md p-2 py-4">
          <div className="flex justify-center">
            <Link className="flex items-center text-white" to={'/'} >
              <img className="h-56 w-auto" src={logo} alt="Pinokio" />
            </Link>
          </div>
          <div className="px-4 py-8 sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
