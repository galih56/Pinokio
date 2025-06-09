"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, UserIcon } from "lucide-react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/types/api";
import { useSearchUsers } from "../api/search-users";

interface UserSearchProps {
  onSelect?: (user: User) => void;
  placeholder?: string;
}

export function UserSearch({ onSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ✅ Use the correct query hook
  const { data: users = [], isLoading, isError, refetch } = useSearchUsers({
    queryConfig: { enabled: !!debouncedSearchQuery.trim() },
    search: debouncedSearchQuery,
  });

  // Handle user selection
  const handleSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setOpen(false);
      onSelect?.(user);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between my-1">
          {selectedUser ? selectedUser.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false} aria-disabled={'false'} disablePointerSelection={false}>
          <CommandInput placeholder={placeholder} value={searchQuery} onValueChange={setSearchQuery} className="h-9" />
          <CommandList className="overflow-auto" aria-disabled={'false'} >
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
              </div>
            )} 
            {!isLoading && isError && (
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-sm text-destructive">Failed to load users.</span>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              </CommandEmpty>
            )}

            {users.length === 0 && !isLoading && !isError && <CommandEmpty>No users found.</CommandEmpty>}

            {users.map((user,i) => (
              <CommandItem key={user.id+'-'+i} disabled={false} aria-disabled={'false'} value={user.id} onSelect={() => handleSelect(user.id)}>
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                {selectedUser?.id === user.id && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
