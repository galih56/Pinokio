import { useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/react-query"
import { api } from "@/lib/api-client"

interface UpdateTeamMembersParams {
  teamId: string
  memberIds: string[]
}

interface UpdateTeamMembersOptions {
  teamId: string
  config?: {
    onSuccess?: () => void
    onError?: (error: Error | null) => void
  }
}

// Function to update team members
const updateTeamMembers = async ({ teamId, memberIds }: UpdateTeamMembersParams) => {
  const response = await api.put(`/teams/${teamId}/members`, { memberIds })
  return response.data
}

// Hook to use the update team members mutation
export const useUpdateTeamMembers = ({ teamId, config }: UpdateTeamMembersOptions) => {
  return useMutation({
    mutationFn: (params: UpdateTeamMembersParams) => updateTeamMembers(params),
    onSuccess: () => {
      // Invalidate the team query to refetch with updated members
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] })
      config?.onSuccess?.()
    },
    onError: (error: Error) => {
      config?.onError?.(error)
    },
  })
}

