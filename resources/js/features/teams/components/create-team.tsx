"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTeamInputSchema, useCreateTeam } from "../api/create-team"
import { useIsFetching } from "@tanstack/react-query"
import { ColorPickerPopover } from "@/components/ui/color-picker-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiUserSelect } from "@/features/users/components/multi-users-select"
import { UserSearch } from "@/features/users/components/user-search-input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type CreateTeamType = {
  onSuccess?: Function
  onError?: Function
}

// Extend the schema to include members array
const extendedCreateTeamSchema = createTeamInputSchema.extend({
  members: z
    .array( z.string())
    .min(1, "Please add at least one team member"),
})

export default function CreateTeam({ onSuccess, onError }: CreateTeamType) {
  const createTeamMutation = useCreateTeam({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        onError?.()
      },
    },
  })

  const isFetching = useIsFetching()
  const form = useForm<z.infer<typeof extendedCreateTeamSchema>>({
    resolver: zodResolver(extendedCreateTeamSchema),
    defaultValues: {
      color: "#ffffff",
      members: [],
    },
  })

  async function onSubmit(values: z.infer<typeof extendedCreateTeamSchema>) {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Required fields are empty")
      return
    }
    createTeamMutation.mutate(values)
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
              <FormLabel>Team Color </FormLabel>
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
                  placeholder="Search for users to add"
                  onChange={(members) => field.onChange(members.map(member => member.id))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> 

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="submit" isLoading={createTeamMutation.isPending} disabled={Boolean(isFetching)}>
            Create Team
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

