import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { User } from "@/types/api";

export const searchUsers = (query: string): Promise<User[]> => {
  return api.get(`/users/search`, { params: { keyword: query } }).then((res) => res.data);
};

export const getUsersQueryOptions = ({ keyword = "" }: { keyword?: string } = {}) => {
  return queryOptions({
    queryKey: ["users-search", { keyword }],
    queryFn: () => searchUsers(keyword),
    enabled: !!keyword.trim(), 
  });
};

type UseSearchUsersOptions = {
  search?: string;
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useSearchUsers = ({ search = "", queryConfig }: UseSearchUsersOptions) => {
  return useQuery({
    ...getUsersQueryOptions({ keyword: search }), 
    ...queryConfig,
    select: (data) => data || [],
  });
};
