import { configureAuth } from './react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';

import { api } from './api-client';
import { useBaseName } from '@/hooks/use-basename';
import useAuth from '@/store/useAuth';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

const getUser = async (): Promise<User> => {
  try {
    const { setAuth } = useAuth.getState();
    const { status, data : user, accessToken, tokenType} = await api.post('/auth/me') as AuthResponse;
    if(status == 'success') setAuth({
      accessToken : accessToken,
      tokenType : tokenType,
      user : user,
      authenticated : true
    });
    return user;
  } catch (error) {
    console.error('getUser error:', error); 
    throw error;
  }
};

const logout = async (): Promise<void>  => {
  try {
    const { clearAuth } = useAuth.getState();
    await api.post('/auth/logout');
    clearAuth();
  } catch (error) {
    console.error('logout error:', error); 
    throw error;
  }
};

export const loginInputSchema = z.object({
  usernameOrEmail: z.string().min(2, {
    message: "Username/Email must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export type LoginInput = z.infer<typeof loginInputSchema>;


const loginWithEmailAndPassword = async (data: LoginInput): Promise<AuthResponse> => {
  try {
    const { setAuth } = useAuth.getState();
    const response = await api.post('/auth/login', data) as AuthResponse;

    if(response.status == 'success'){
      const { tokenType, data : user, accessToken } = response;
      const auth = { user, accessToken, tokenType, authenticated: true };
      setAuth(auth);
    }
    
    return response;  
  } catch (error) {
    throw error;
  }
};

export const registerInputSchema = z.object({
  name: z.string().min(1, 'Email harus diisi'),
  email: z.string().min(1, 'Email harus diisi').email(),
  password: z.string().min(1, 'Password harus diisi'),
  passwordConfirm: z.string().min(1, 'Konfirmasi password harus diisi'),
})
.refine((data) => data.password === data.passwordConfirm, {
    message: "Konfirmasi password salah",
    path: ["passwordConfirm"],
})
export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput,
): Promise<AuthResponse> => {  
  try {
    return api.post('/auth/register', data);
  } catch (error) {
    console.error('Login error:', error); // Handle error properly
    throw error; // Or return a custom error
  }
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.data;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.data;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = useAuth();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  

  useEffect(() => {
    if (!authenticated) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [authenticated, location.pathname]);

  if (redirecting) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <AuthLoader
      renderLoading={() => (
      <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
      </div>
      )}
    >
      {children}
    </AuthLoader>
  );
};
