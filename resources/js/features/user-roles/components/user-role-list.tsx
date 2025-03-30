import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useUserRoles } from '../api/get-user-roles';
import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { UserRole } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, CheckIcon, MoreHorizontal } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { useDisclosure } from '@/hooks/use-disclosure';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { UpdateUserRole } from './update-user-role';

export type UserRolesListProps = {
  onUserRolePrefetch?: (id: string) => void;
};

export const UserRolesList = ({
  onUserRolePrefetch,
}: UserRolesListProps) => {
  const navigate = useNavigate();
  const [ choosenUserRole, setChoosenUserRole ] = useState<UserRole | undefined>();
  const { open, isOpen, close ,toggle } = useDisclosure();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const userRolesQuery = useUserRoles({
    page: currentPage,
    perPage : 15,
    search,
  });

  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    // Sync the search term with query parameters
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (searchTerm) {
          params.set('search', searchTerm);
        } else {
          params.delete('search');
        }
        return params;
      });
    }, 300); // Add debounce to avoid excessive API calls

    return () => clearTimeout(timeout);
  }, [searchTerm, setSearchParams]);

  const queryClient = useQueryClient();

  const userRoles = userRolesQuery.data?.data || [];
  const meta = userRolesQuery.data?.meta;

  
  const columns: ColumnDef<UserRole>[] = [ 
    {
      id: "actions",
      cell: ({ row }) => {
        const userRole = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setChoosenUserRole(userRole);
                  open()
                }}
              >
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "code",
      header : 'Code',
    },
    {
      accessorKey: "name",
      header : 'Name',
    },
    {
      accessorKey: "updatedAt",
      header : 'Updated At',
      cell : ({row}) => {
        const userRole = row.original
        return formatDateTime(userRole.updatedAt)
      }
    },
    {
      accessorKey: "createdAt",
      header : 'Created At',
      cell : ({row}) => {
        const userRole = row.original
        return formatDateTime(userRole.createdAt)
      }
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(
      ['userRoles', { page: newPage }],
      userRolesQuery.data 
    ); 
    navigate(`?page=${newPage}`);
    userRolesQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Search user roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {userRolesQuery.isPending ?
        <Skeleton className='w-full min-h-[60vh]'/> 
        : 
        userRoles.length > 0 ?
          <DataTable
            data={userRoles}
            columns={columns}
            pagination={
              meta && {
                totalPages: meta.totalPages,
                perPage: meta.perPage,
                totalCount: meta.totalCount,
                currentPage: meta.currentPage,
                rootUrl: '',
              }
            } 
            onPaginationChange={onPageChange}
          /> :  
          <div className="flex items-center justify-center w-full min-h-[60vh]">
            <p className="text-gray-500">No userRoles found.</p>
          </div>}
        { choosenUserRole?.id &&
          <DialogOrDrawer 
              open={isOpen}
              onOpenChange={toggle}
              title={"Edit User Role"}
            >
              <UpdateUserRole userRoleId={choosenUserRole?.id} 
                onSuccess={() => { 
                  setChoosenUserRole(undefined); close(); 
                  userRolesQuery.refetch();
                }}/>
          </DialogOrDrawer>}
    </div>
  );
};
