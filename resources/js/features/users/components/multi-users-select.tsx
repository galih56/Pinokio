"use client"

import * as React from "react"
import { X, UserPlus, UserIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserSearch } from "@/features/users/components/user-search-input"
import { User } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { useFormContext } from "react-hook-form"

interface MultiUserSelectProps {
  name: string
  apiUrl: string
  placeholder?: string
  maxHeight?: number
  onChange?: (users: User[]) => void
  defaultValue?: User[]
}

export function MultiUserSelect({
  name,
  apiUrl,
  placeholder = "Search for users...",
  maxHeight = 300,
  onChange,
  defaultValue = []
}: MultiUserSelectProps) {
  const { setValue, getValues } = useFormContext()
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>(defaultValue)

  // Update form value when selected users change
  React.useEffect(() => {
    setValue(name, selectedUsers)
    onChange?.(selectedUsers)
  }, [selectedUsers, name, setValue, onChange])

  // Add user to selection
  const handleSelectUser = (user: User) => {
    // Check if user is already selected
    if (!selectedUsers.some(selectedUser => selectedUser.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user]
      setSelectedUsers(newSelectedUsers)
    }
  }

  // Remove user from selection
  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(user => user.id !== userId)
    setSelectedUsers(newSelectedUsers)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {selectedUsers.length} {selectedUsers.length === 1 ? "member" : "members"} selected
        </div>
      </div>

      {/* User search input */}
      <UserSearch
        apiUrl={apiUrl}
        placeholder={placeholder}
        onSelect={handleSelectUser}
      />

      {/* Selected users list */}
      {selectedUsers.length > 0 && (
        <div className="border rounded-md">
          <ScrollArea className={`p-2 max-h-[${maxHeight}px]`}>
            <div className="space-y-2">
              {selectedUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar || "/placeholder.svg"} 
                        alt={user.name} 
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {user.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
