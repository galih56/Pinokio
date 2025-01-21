import { useNavigate, useSearchParams } from 'react-router-dom';

import { getUsersQueryOptions, useUsers } from '../api/get-users';
import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { User } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { getUserQueryOptions } from "../api/get-user"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { capitalizeFirstChar } from '@/lib/common';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate, formatDateTime } from '@/lib/datetime';
import { VariantType } from '@/types/ui';
import { queryClient } from '@/lib/react-query';

export type UsersListProps = {
  onUserPrefetch?: (id: string) => void;
};

export const UsersList = ({
  onUserPrefetch,
}: UsersListProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const usersQuery = useUsers({
    page: currentPage,
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

  const users = usersQuery.data?.data;
  const meta = usersQuery.data?.meta;

  
  const columns: ColumnDef<User>[] = [ 
    {
    id: "actions",
    cell: ({ row }) => {
        const user = row.original
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
              <Link
                  onMouseEnter={() => {
                    // Prefetch the discussion data when the user hovers over the link
                    queryClient.prefetchQuery(getUserQueryOptions(user.id));
                    onUserPrefetch?.(user.id);
                  }}
                  to={paths.user.getHref(user.id)}
                >
                  <DropdownMenuItem>
                    View
                  </DropdownMenuItem> 
                </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
    {
      accessorKey: "name",
      header : 'Name',
    },
    {
      accessorKey: "username",
      header : 'Username',
    },
    {
      accessorKey: "email",
      header : 'Email',
    },
    {
      accessorKey: "role",
      header : 'Role',
      cell : ({row}) => {
        const user = row.original;
        if(!user.role) return '-';
        
        let badgeVariant : VariantType = 'info'
        switch (user?.role.code) {
          case 'HR':
              badgeVariant = 'warning';
              break;
  
          case 'ADMIN':
              badgeVariant = 'destructive';
              break;
          default:
              break;
      }
        return <Badge variant={badgeVariant}>{capitalizeFirstChar(user.role.name)}</Badge>
      }
    },
    {
      accessorKey: "updatedAt",
      header : 'Updated At',
      cell : ({row}) => {
        const user = row.original;
        if(!user.updatedAt) return '-';
        
        return formatDateTime(user.updatedAt)
      }
    },
    {
      accessorKey: "createdAt",
      header : 'Created At',
      cell : ({row}) => {
        const user = row.original;
        if(!user.createdAt) return '-';
        
        return formatDateTime(user.createdAt)
      }
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(
      ['users', { page: newPage }],
      usersQuery.data 
    ); 
    navigate(`?page=${newPage}`);
    usersQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!usersQuery.isPending && users?.length ? 
          <DataTable
            data={users}
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
          /> :  <Skeleton className='w-full min-h-[60vh]'/>}
    </div>
  );
};
