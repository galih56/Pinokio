import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Issue } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { getIssueQueryOptions } from "../api/get-issue"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/issue-tracker/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/datetime';
import { usePublicIssues } from '../api/get-public-issues';
import { VariantType } from '@/types/ui';
import { capitalizeFirstChar } from '@/lib/common';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './status-badge';

export type PublicIssuesProps = {
  onIssuePrefetch?: (id: string) => void;
};

export const PublicIssues = ({
  onIssuePrefetch,
}: PublicIssuesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const issuesQuery = usePublicIssues({
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

  const queryClient = useQueryClient();

  const issues = issuesQuery.data?.data;
  const meta = issuesQuery.data?.meta;

  
  const columns: ColumnDef<Issue>[] = [ 
    {
      id: "actions",
      cell: ({ row }) => {
          const issue = row.original
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
                      queryClient.prefetchQuery(getIssueQueryOptions(issue.id));
                      onIssuePrefetch?.(issue.id);
                    }}
                    to={paths.issue.getHref(issue.id)}
                  >
                    <DropdownMenuItem>
                      View
                    </DropdownMenuItem> 
                  </Link>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "title",
      header : 'Title',
    },
    {
      accessorKey: "description",
      header : 'Description',
    },
    {
      accessorKey: "dueDate",
      header : 'Due Date',
      cell : ({row}) => {
        const issue = row.original;
        if(!issue.dueDate) return '-';
        
        return formatDate(issue.dueDate)
      }
    },
    {
      accessorKey: "status",
      header : 'Status',
      cell : ({row}) => {
        const issue = row.original;
      
        return <StatusBadge status={issue.status}/>
      }
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(
      ['issues', { page: newPage }],
      issuesQuery.data 
    ); 
    navigate(`?page=${newPage}`);
    issuesQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!issuesQuery.isPending && issues ? <DataTable
          data={issues}
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
