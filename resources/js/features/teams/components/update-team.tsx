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
import { useEffect, useState } from "react"
import { Team, User } from "@/types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PenIcon, Users2Icon } from "lucide-react"
import { TeamMembersList } from "./team-members-list"
import { useTeam } from "../api/get-team"
import { Textarea } from "@/components/ui/textarea"

type UpdateTeamProps = {
  data: Team;
  onSuccess?: () => void;
  onError?: () => void;
}

// Extend schema to include members
const extendedUpdateTeamSchema = updateTeamInputSchema.extend({
  members: z.array(z.string()).min(1, "Please add at least one team member"),
})

export default function UpdateTeam({ data, onSuccess, onError }: UpdateTeamProps) {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("details");
  const teamQuery = useTeam({
    teamId : data.id
  })
  
  const team = teamQuery.data?.data || null;

  const updateTeamMutation = useUpdateTeam({
    teamId: data.id,
    config: {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: () => {
        onError?.()
      },
    },
  })
  const memberIds = (data.members ? data.members.map((m) => m.id) : []);
  
  const form = useForm<z.infer<typeof extendedUpdateTeamSchema>>({
    resolver: zodResolver(extendedUpdateTeamSchema),
    defaultValues: {
      name: data.name,
      description: data.description,
      color: data.color || "#ffffff",
      members: memberIds, // Extract IDs
    },
  })

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description ?? "",  // Ensure it’s never undefined
        color: team.color || "#ffffff",
        members: team.members ? team.members.map((m) => m.id) : [],
      });
    }
  }, [team, form]);

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
    updateTeamMutation.mutate({ 
      teamId : data.id,
      data : values
    }) 
  }

  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <PenIcon className="h-4 w-4" />
          Team Details
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users2Icon className="h-4 w-4" />
          Team Members
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
            <CardDescription>Update your data's basic information</CardDescription>
          </CardHeader>
          <CardContent>
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
                        <Input {...field} placeholder="Enter data name" />
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
                  <Button type="submit" isLoading={updateTeamMutation.isPending}>
                    Update Team
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="members" className="mt-4">
        <TeamMembersList 
          members={data.members} 
          isEditable={true}
          emptyMessage="No data members yet. Add members using the search above."
          />
      </TabsContent>
    </Tabs>
  )
}
