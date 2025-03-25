"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateTeamInputSchema, useUpdateTeam } from "../api/update-team"
import { useNotifications } from "@/components/ui/notifications"
import { ColorPickerPopover } from "@/components/ui/color-picker-popover"
import { MultiUserSelect } from "@/features/users/components/multi-users-select"
import { useEffect } from "react"
import { Team, User } from "@/types/api"

type UpdateTeamProps = {
  team: Team;
  onSuccess?: () => void;
  onError?: () => void;
}

// Extend schema to include members
const extendedUpdateTeamSchema = updateTeamInputSchema.extend({
  members: z.array(z.string()).min(1, "Please add at least one team member"),
})

export default function UpdateTeam({ team, onSuccess, onError }: UpdateTeamProps) {
  const { addNotification } = useNotifications()
  const updateTeamMutation = useUpdateTeam({
    teamId: team.id,
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

  const form = useForm<z.infer<typeof extendedUpdateTeamSchema>>({
    resolver: zodResolver(extendedUpdateTeamSchema),
    defaultValues: {
      name: team.name,
      color: team.color || "#ffffff",
      members: team.members.map((m) => m.id), // Extract IDs
    },
  })

  useEffect(() => {
    // Sync team data when it changes
    form.reset({
      name: team.name,
      color: team.color || "#ffffff",
      members: team.members.map((m) => m.id),
    })
  }, [team, form])

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
    updateTeamMutation.mutate({ id: team.id, ...values }) // Send ID along with updated values
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter team name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color Field */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Color</FormLabel>
              <FormControl>
                <ColorPickerPopover value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Team Members Field */}
        <FormField
          control={form.control}
          name="members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Members</FormLabel>
              <FormControl>
                <MultiUserSelect
                  name="members"
                  apiUrl="/users/search"
                  placeholder="Search for users to add"
                  defaultValue={team.members} // Prefill existing members
                  onChange={(members) => field.onChange(members.map((m) => m.id))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="submit" isLoading={updateTeamMutation.isPending}>
            Update Team
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
