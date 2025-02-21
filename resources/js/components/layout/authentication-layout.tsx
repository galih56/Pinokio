import * as React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Head } from '@/components/seo';
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import useAuth from '@/store/useAuth';
import { Card, CardContent } from '../ui/card';

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
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">

          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2"> 
              <div className="px-4 py-8 sm:px-10">        
                {children}
              </div>
              <div className="relative hidden md:flex md:flex-col md:justify-center">    
                <div className='flex flex-col items-center justify-center h-full'>
                  <div className="px-8 py-6 text-center text-xl text-cyan-800">
                    <a href={import.meta.env.VITE_BASE_URL + "/request-tracker"} className="hover:text-brand underline underline-offset-4">
                      Submit issues as a guest
                    </a>
                  </div>
                  <div className="mt-6 rounded-lg p-6">
                    <h2 className="mb-2 text-lg font-semibold">Have an issue? We're here to help!</h2>
                    <p className="text-sm text-muted-foreground">
                      Whether you're experiencing problems with our services or have suggestions for improvement, we want to hear
                      from you. Your feedback is crucial in helping us enhance our business processes and provide better service.
                      Don't hesitate to submit your concerns – we're committed to addressing them promptly and effectively.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>  
          </Card>  
        </div>
      </div>
    </>
  );
};
