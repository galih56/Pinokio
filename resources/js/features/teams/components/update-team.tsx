"use client"

import { Pen, Users } from "lucide-react"

import { Input } from "@/components/ui/input"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { useNotifications } from "@/components/ui/notifications"
import { Authorization, ROLES } from "@/lib/authorization"
import { useTeam } from "../api/get-team"
import { updateTeamInputSchema, useUpdateTeam } from "../api/update-team"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DialogFooter } from "@/components/ui/dialog"
import { ColorPickerPopover } from "@/components/ui/color-picker-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamMembersList } from "./team-members-list"
import type { User } from "@/types/api"
import { UserSearch } from "@/features/users/components/user-search-input"
import { useUpdateTeamMembers } from "../api/update-team-members"

// Extend the schema to include members
const extendedUpdateTeamSchema = updateTeamInputSchema.extend({
  members: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        avatar: z.string().optional(),
        role: z.string().optional(),
      }),
    )
    .optional(),
})

type UpdateTeamProps = {
  teamId: string
  onSuccess?: () => void
  onError?: () => void
}

export const UpdateTeam = ({ teamId, onSuccess, onError }: UpdateTeamProps) => {
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState("details")

  const teamQuery = useTeam({ teamId })
  const updateTeamMutation = useUpdateTeam({
    teamId: teamId,
    config: {
      onSuccess: () => {
        addNotification({
          type: "success",
          title: "Team updated successfully",
          toast: true,
        })
        onSuccess?.()
      },
      onError: () => {
        addNotification({
          type: "error",
          title: "Failed to update team",
          toast: true,
        })
        onError?.()
      },
    },
  })

  const updateTeamMembersMutation = useUpdateTeamMembers({
    teamId: teamId,
    config: {
      onSuccess: () => {
        addNotification({
          type: "success",
          title: "Team members updated successfully",
          toast: true,
        })
      },
      onError: (error) => {
        addNotification({
          type: "error",
          title: "Failed to update team members",
          toast: true,
        })
      },
    },
  })

  const team = teamQuery.data?.data
  const [selectedMembers, setSelectedMembers] = useState<User[]>([])

  const form = useForm<z.infer<typeof extendedUpdateTeamSchema>>({
    resolver: zodResolver(extendedUpdateTeamSchema),
    defaultValues: {
      name: team?.name || "",
      color: team?.color || "#ffffff",
      members: [],
    },
  })

  useEffect(() => {
    if (team) {
      form.reset({
        name: team?.name || "",
        color: team?.color || "#ffffff",
        members: team?.members || [],
      })

      setSelectedMembers(team?.members || [])
    }
  }, [team, form.reset])

  async function onSubmit(values: z.infer<typeof extendedUpdateTeamSchema>) {
    const isValid = await form.trigger()
    if (!isValid) {
      addNotification({
        type: "error",
        title: "Required fields are empty",
        toast: true,
      })
      return
    }

    // Only send the basic team details (name, color, isPublic)
    const { members, ...teamDetails } = values
    updateTeamMutation.mutate({ data: teamDetails, teamId: team?.id! })
  }

  const handleAddMember = (user: User) => {
    // Check if user is already a member
    if (!selectedMembers.some((member) => member.id === user.id)) {
      const newMembers = [...selectedMembers, user]
      setSelectedMembers(newMembers)
      form.setValue("members", newMembers)
    } else {
      addNotification({
        type: "warning",
        title: "User already added",
        toast: true,
      })
    }
  }

  const handleRemoveMember = (userId: string) => {
    const newMembers = selectedMembers.filter((member) => member.id !== userId)
    setSelectedMembers(newMembers)
    form.setValue("members", newMembers)
  }

  const handleUpdateMembers = async () => {
    if (!team) return

    updateTeamMembersMutation.mutate({
      teamId: team.id,
      memberIds: selectedMembers.map((member) => member.id),
    })
  }

  if (teamQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!team) {
    return null
  }

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            Team Details
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>Update your team's basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Color Picker Field */}
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-4 space-y-0">
                        <FormLabel className="whitespace-nowrap">Team Color</FormLabel>
                        <FormControl>
                          <ColorPickerPopover value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Public/Private Field */}
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Public Team</FormLabel>
                          <FormDescription>Make this team visible to all users</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="pt-4">
                    <Button type="submit" isLoading={updateTeamMutation.isPending}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage the members of this team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-medium">Add New Member</div>
                <UserSearch apiUrl="/users/search" placeholder="Search for users to add" onSelect={handleAddMember} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Current Members ({selectedMembers.length})</div>
                  <Button
                    size="sm"
                    onClick={handleUpdateMembers}
                    isLoading={updateTeamMembersMutation.isPending}
                    disabled={updateTeamMembersMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>

                <TeamMembersList
                  members={selectedMembers}
                  isEditable={true}
                  onRemoveMember={handleRemoveMember}
                  emptyMessage="No team members yet. Add members using the search above."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Authorization>
  )
}

