"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, UserIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { User } from "@/types/api"


interface UserSearchProps {
  onSelect?: (user: User) => void
  placeholder?: string
  apiUrl?: string
}

export function UserSearch({
  onSelect,
  placeholder = "Search users...",
  apiUrl = "/api/users/search",
}: UserSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch users from API when search query changes
  React.useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedSearchQuery && debouncedSearchQuery !== "") return

      setLoading(true)
      setError(null)

      try {
        // Add the search query as a query parameter
        const queryParams = new URLSearchParams()
        if (debouncedSearchQuery) {
          queryParams.append("q", debouncedSearchQuery)
        }

        const response = await fetch(`${apiUrl}?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again.")
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [debouncedSearchQuery, apiUrl])

  // Handle user selection
  const handleSelect = (user: User) => {
    setSelectedUser(user)
    setOpen(false)
    if (onSelect) {
      onSelect(user)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedUser ? selectedUser.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            {loading && (
              <CommandLoading>
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              </CommandLoading>
            )}

            {error && !loading && (
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-sm text-destructive">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery(debouncedSearchQuery)
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </CommandEmpty>
            )}

            {!loading && !error && users.length === 0 && <CommandEmpty>No users found.</CommandEmpty>}

            {!loading && !error && users.length > 0 && (
              <CommandGroup heading="Users">
                {users.map((user) => (
                  <CommandItem key={user.id} value={user.id} onSelect={() => handleSelect(user)} className="gap-2">
                    {user.avatar ? (
                      <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-6 w-6 rounded-full" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    {selectedUser?.id === user.id && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

