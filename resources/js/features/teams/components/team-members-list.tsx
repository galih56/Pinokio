"use client"

import type { User } from "@/types/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserMinus, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamMembersListProps {
  members: User[]
  isEditable?: boolean
  onRemoveMember?: (userId: string) => void
  maxHeight?: number
  emptyMessage?: string
}

export function TeamMembersList({
  members,
  isEditable = false,
onRemoveMember,
  maxHeight = 300,
  emptyMessage = "No team members yet",
}: TeamMembersListProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md bg-muted/20">
        <UserIcon className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <ScrollArea className="p-1" style={{ maxHeight }}>
        <div className="space-y-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground">{member.email}</span>
                </div>
              </div>

              {isEditable && onRemoveMember && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveMember(member.id)}
                >
                  <UserMinus className="h-4 w-4" />
                  <span className="sr-only">Remove {member.name}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

