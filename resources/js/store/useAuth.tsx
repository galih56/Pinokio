import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';                                    
import { User } from '@/types/api';

export interface AuthStateType {
  accessToken: string,
  tokenType: string,
  authenticated: boolean,
  user : User
}

interface AuthStore extends AuthStateType{
  setAuth: (auth: AuthStateType) => void;
  setUserInfo: (user: User) => void;
  clearAuth: () => void;
};


export const initialAuthStateType: AuthStateType = {
  accessToken: '',
  tokenType: '',
  authenticated: false,
  user: {
    username: '',
    email: '',
    name: '',
    role: undefined
  },
};


const useAuth = create(
    persist<AuthStore>(
      (set) => ({
        key: 'auth', 
        ...initialAuthStateType, 
        setAuth: (auth: AuthStateType) => {
          set({
            user : auth.user,
            accessToken: auth.accessToken,
            tokenType: auth.tokenType,
            authenticated: auth.authenticated,
          });
        },
        clearAuth: () => {
          set(initialAuthStateType);
        },
        setUserInfo : (user: User) => {
          set({
            user : user
          });
        }
      }),
      {
        name: 'PINOKIO-USER-AUTH',
        storage: createJSONStorage(() => localStorage)
      }
  )
);

export default useAuth;