import { ROLES } from '@/lib/authorization';
import useAuth from '@/store/useAuth';

export const DashboardRoute = () => {
  const { user } = useAuth();

  return (
    <>
      <h1 className="text-xl">
        Welcome <b>{`${user?.name}`}</b>
      </h1>
    </>
  );
};
