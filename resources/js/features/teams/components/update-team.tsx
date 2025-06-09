"use client"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateTeamInputSchema, useUpdateTeam } from "../api/update-team"
import { ColorPickerPopover } from "@/components/ui/color-picker-popover"
import { Team, User } from "@/types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PenIcon, Users2Icon } from "lucide-react"
import { TeamMembersList } from "./team-members-list"
import { useTeam } from "../api/get-team"
import { Textarea } from "@/components/ui/textarea"
import { UserSearch } from "@/features/users/components/user-search-input"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Schema for team details form
const teamDetailsSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

// Schema for team members form
const teamMembersSchema = z.object({
  members: z.array(z.string()).min(1, "Please add at least one team member"),
});

type UpdateTeamProps = {
  data: Team;
  onSuccess?: () => void;
  onError?: () => void;
};

export default function UpdateTeam({ data, onSuccess, onError }: UpdateTeamProps) {
  const [activeTab, setActiveTab] = useState("details")
  const teamQuery = useTeam({
    teamId: data.id
  })
  
  const team = teamQuery.data?.data || null

  const updateTeamMutation = useUpdateTeam({
    teamId: data.id,
    config: {
      onSuccess: (_, variables) => {
        onSuccess?.()
        
        const message = variables.data.members !== undefined 
          ? "Team members updated successfully" 
          : "Team details updated successfully"
        
        toast.success(message)
      },
    },
  })

  // Form for team details
  const detailsForm = useForm<z.infer<typeof teamDetailsSchema>>({
    resolver: zodResolver(teamDetailsSchema),
    defaultValues: {
      name: data.name,
      description: data.description || "",
      color: data.color || "#ffffff",
    },
  })

  // Track current members and handle management
  const [currentMembers, setCurrentMembers] = useState<User[]>(data.members || [])

  // Form for team members
  const membersForm = useForm<z.infer<typeof teamMembersSchema>>({
    resolver: zodResolver(teamMembersSchema),
    defaultValues: {
      members: currentMembers.map(m => m.id),
    },
  })

  useEffect(() => {
    if (team) {
      detailsForm.reset({
        name: team.name,
        description: team.description ?? "",
        color: team.color || "#ffffff",
      })
      
      const memberIds = team.members ? team.members.map(m => m.id) : []
      membersForm.reset({
        members: memberIds,
      })
      setCurrentMembers(team.members || [])
    }
  }, [team, detailsForm, membersForm])

  // Keep form in sync with current members state
  useEffect(() => {
    membersForm.setValue("members", currentMembers.map(m => m.id))
  }, [currentMembers, membersForm])

  const handleRemoveMember = (userId: string) => {
    setCurrentMembers((prevMembers) => {
      const filtered = prevMembers.filter((member) => member.id !== userId)
      return filtered
    })
  }

  const handleAddMember = (user: User) => {
    setCurrentMembers((prevMembers) => {
      if (!prevMembers.find((member) => member.id === user.id)) {
        return [...prevMembers, user]
      }
      return prevMembers
    })
  }

  async function onSubmitDetails(values: z.infer<typeof teamDetailsSchema>) {
    const isValid = await detailsForm.trigger()
    if (!isValid) {
      toast.error("Required fields are empty")
      return
    }

    // Only update team details - don't touch members
    updateTeamMutation.mutate({
      teamId: data.id,
      data: {
        name: values.name,
        description: values.description,
        color: values.color,
        // Not including members intentionally
      },
    })
  }

  async function onSubmitMembers(values: z.infer<typeof teamMembersSchema>) {
    const isValid = await membersForm.trigger()
    if (!isValid) {
      toast.error("Please add at least one team member")
      return
    }

    // Only update members - don't touch other team details
    updateTeamMutation.mutate({
      teamId: data.id,
      data: {
        members: values.members,
        // Not including other team details intentionally
      },
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
            <CardDescription>Update your team's basic information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...detailsForm}>
              <form onSubmit={detailsForm.handleSubmit(onSubmitDetails)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={detailsForm.control}
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
                  control={detailsForm.control}
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

                <FormField
                  control={detailsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe the team's purpose..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" isLoading={updateTeamMutation.isPending}>
                    Update Team Details
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
            <CardDescription>Manage team members by adding or removing them</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...membersForm}>
              <form onSubmit={membersForm.handleSubmit(onSubmitMembers)} className="space-y-6">
                <UserSearch onSelect={handleAddMember} placeholder="Search and add members..." />
                <TeamMembersList 
                  members={currentMembers} 
                  isEditable={true}
                  onRemoveMember={handleRemoveMember} 
                  emptyMessage="No team members yet. Add members using the search above."
                />
                
                {/* Hidden field to track members for form validation */}
                <FormField
                  control={membersForm.control}
                  name="members"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    isLoading={updateTeamMutation.isPending}
                    disabled={currentMembers.length === 0}
                  >
                    Update Team Members
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}