import { api } from "@/lib/api-client";
import { User } from "@/types/api";

export const searchUsers = (query: string): Promise<User[]> => {
  return api.get(`/users/search`, { params: { q: query } }).then((res) => res.data);
};
