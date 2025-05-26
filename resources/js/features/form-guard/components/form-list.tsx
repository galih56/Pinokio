import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Form } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate, formatDateTime, formatTime } from '@/lib/datetime';
import { getFormQueryOptions } from '@/features/form-guard/api/get-form';
import { useForms } from '@/features/form-guard/api/get-forms';

export type FormsListProps = {
  onFormPrefetch?: (id: string) => void;
};

export const FormsList = ({
  onFormPrefetch,
}: FormsListProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const formsQuery = useForms({
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

  const forms = formsQuery.data?.data || [];
  const meta = formsQuery.data?.meta;

  
  const columns: ColumnDef<Form>[] = [ 
    {
      id: "actions",
      cell: ({ row }) => {
          const form = row.original
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
                      queryClient.prefetchQuery(getFormQueryOptions(form.id));
                      onFormPrefetch?.(form.id);
                    }}
                    to={paths.form.getHref(form.id)}
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
      meta :{ cellClassName :  "max-w-[40vh]" },
      cell : ({row}) => {
        const form = row.original;

        return (
          <div>
            <Link
                onMouseEnter={() => {
                  queryClient.prefetchQuery(getFormQueryOptions(form.id));
                  onFormPrefetch?.(form.id);
                }}
                to={paths.form.getHref(form.id)}
              >
                <p>{form.title}</p>
            </Link>
          </div> 
        )
      }
    },
    {
      accessorKey: "createdAt",
      header : 'Created At',
      cell : ({row}) => {
        const form = row.original;
        if(!form.createdAt) return '-';
        
        return <span className='text-xs text-nowrap'>{formatDate(form.createdAt)} <br/>{formatTime(form.createdAt)}</span>
      }
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(
      ['forms', { page: newPage }],
      formsQuery.data 
    ); 
    navigate(`?page=${newPage}`);
    formsQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {formsQuery.isPending ? 
         <Skeleton className='w-full min-h-[60vh]'/> 
         : forms.length > 0 ?
          <DataTable
            data={forms}
            columns={columns}
            pagination={
              meta && {
                totalPages: meta.totalPages,
                perPage: meta.perPage,
                totalCount: meta.totalCount,
                currentPage: meta.currentPage,
                rootUrl: import.meta.env.VITE_BASE_URL,
              }
            } 
            onPaginationChange={onPageChange}
          />: 
          <div className="flex items-center justify-center w-full min-h-[60vh]">
            <p className="text-gray-500">No forms found.</p>
          </div>}
    </div>
  );
};
