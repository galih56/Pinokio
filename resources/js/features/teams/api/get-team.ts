import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Team } from '@/types/api';

export const getTeam = ({
  teamId,
}: {
  teamId: string;
}): Promise<{ data: Team }> => {
  return api.get(`/teams/${teamId}`);
};

export const getTeamQueryOptions = (teamId: string) => {
  return queryOptions({
    queryKey: ['teams', teamId],
    queryFn: () => getTeam({ teamId }),
  });
};

type UseTeamOptions = {
  teamId: string;
  queryConfig?: QueryConfig<typeof getTeamQueryOptions>;
};

export const useTeam = ({
  teamId,
  queryConfig,
}: UseTeamOptions) => {
  return useQuery({
    ...getTeamQueryOptions(teamId),
    ...queryConfig,
  });
};
