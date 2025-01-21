import * as React from 'react';

import { User, UserRole } from '@/types/api';

import { useUser } from './auth';
import { Spinner } from '@/components/ui/spinner';
import { NavigationItem } from '@/types/ui';

export enum ROLES {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMP = 'EMP',
}

type RoleTypes = keyof typeof ROLES;

export const POLICIES = {
  'employee:delete': (user: User) => {
    if (user.role?.code === 'ADMIN') {
      return true;
    }
    return false;
  },
};

export const useAuthorization = () => {
  const user = useUser();

  if (user.isPending) {
    return {
      loading: true,
      role: null,
      checkAccess: () => false,
    };
  }

  if (!user.data) {
    throw new Error('User does not exist!');
  }

  type RoleCode = UserRole['code'];
  const checkAccess = React.useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles?.length > 0 && user.data) {
        return allowedRoles.includes(user.data.role?.code as RoleCode);
      }
      return true;
    },
    [user.data],
  );

  return { checkAccess, role: user.data.role };
};

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedRoles: RoleTypes[];
      policyCheck?: never;
    }
  | {
      allowedRoles?: never;
      policyCheck: boolean;
    }
);

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization();

  let canAccess = false;

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles });
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }
  return <>{canAccess ? children : forbiddenFallback}</>;
};

export const useFilteredNavigation = (navigationItems : NavigationItem[]) : NavigationItem[] => {
  const { role, checkAccess  } = useAuthorization();
  
  const filterItemsByRole = (items : any) => {
    return items
      .filter((item : any) => {
        return checkAccess({ allowedRoles : item.roles})}
      )
      .map((item : any) => ({
        ...item,
        items: item.items ? filterItemsByRole(item.items) : undefined,
      }));
  };

  return React.useMemo(() => filterItemsByRole(navigationItems), [navigationItems, role]);
};