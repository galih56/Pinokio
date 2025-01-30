import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTags } from '../api/get-tags';
import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Tag } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { getTagQueryOptions } from "../api/get-tag"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { capitalizeFirstChar } from '@/lib/common';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/datetime';
import { useDisclosure } from '@/hooks/use-disclosure';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { UpdateTag } from './update-tag';

export type TagsListProps = {
  onTagPrefetch?: (id: string) => void;
};

export const TagsList = ({
  onTagPrefetch,
}: TagsListProps) => {
  const navigate = useNavigate();
  const [ choosenTag, setChoosenTag ] = useState<Tag | undefined>();
  const { open, isOpen, close ,toggle } = useDisclosure();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const tagsQuery = useTags({
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

  const tags = tagsQuery.data?.data || [];
  const meta = tagsQuery.data?.meta;

  
  const columns: ColumnDef<Tag>[] = [ 
    {
      id: "actions",
      cell: ({ row }) => {
          const tag = row.original
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
                  setChoosenTag(tag);
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
      accessorKey: "name",
      header : 'Name',
    },
    {
      accessorKey: "color",
      header : 'Color',
      cell :  ({ row }) => {
        const tag = row.original
        return (
          <div className='w-8 h-8 rounded-xl' style={{backgroundColor : tag.color ?? "#fffff"}}>

          </div>
        )
      }
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(
      ['tags', { page: newPage }],
      tagsQuery.data 
    ); 
    navigate(`?page=${newPage}`);
    tagsQuery.refetch();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {tagsQuery.isPending ?
        <Skeleton className='w-full min-h-[60vh]'/> 
        : 
        tags.length > 0 ?
          <DataTable
            data={tags}
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
            <p className="text-gray-500">No tags found.</p>
          </div>}
        { choosenTag &&
          <DialogOrDrawer 
              open={isOpen}
              onOpenChange={toggle}
              title={"Edit Tag"}
              description={"Pastikan data yang anda masukan sudah benar sesuai!"}
            >
              <UpdateTag tagId={choosenTag?.id} onSuccess={() => { setChoosenTag(undefined); close(); }}/>
          </DialogOrDrawer>}
    </div>
  );
};
