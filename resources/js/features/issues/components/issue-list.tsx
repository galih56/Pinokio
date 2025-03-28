import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useIssues } from '../api/get-issues';
import {  DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Issue } from "@/types/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MessageSquare, MessageSquareIcon, MoreHorizontal, Scroll } from "lucide-react"
import { getIssueQueryOptions } from "../api/get-issue"
import { Link } from '@/components/ui/link';
import { paths } from '@/apps/dashboard/paths';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { formatDate, formatDateTime, formatTime } from '@/lib/datetime';
import DOMPurify from 'dompurify';
import { StatusBadge } from '../../../components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { CountIndicator, CountIndicatorContainer } from '@/components/ui/counter-indicator';
import DialogOrDrawer from '@/components/layout/dialog-or-drawer';
import { CommentList } from '@/features/comment/components/comment-list';
import { useDisclosure } from '@/hooks/use-disclosure';
import CreateComment from '@/features/comment/components/create-comment';
import { ScrollArea } from '@/components/ui/scroll-area';

export type IssuesListProps = {
  onIssuePrefetch?: (id: string) => void;
};

export const IssuesList = ({
  onIssuePrefetch,
}: IssuesListProps) => {
  const navigate = useNavigate();
  const [ choosenIssue, setChoosenIssue ] = useState<Issue | null>();
  const { isOpen, open, close, toggle } = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get('search') || '';

  const issuesQuery = useIssues({
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

  const issues = issuesQuery.data?.data || [];
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
      id: "view-comments",
      cell: ({ row }) => {
        const issue = row.original;
        return (
            <Button variant={'ghost'} onClick={() => {
                setChoosenIssue(issue);
                open();
              }}>
              <CountIndicatorContainer>
                <MessageSquareIcon className='h-6 w-6' />
                <CountIndicator count={issue.unreadCommentsCount ?? 0} />
              </CountIndicatorContainer>
            </Button>
        )
      },
    },
    {
      accessorKey: "title",
      header : 'Title',
      meta :{ cellClassName :  "max-w-[40vh]" },
      cell : ({row}) => {
        const issue = row.original;

        return (
          <div>
            <Link
                onMouseEnter={() => {
                  queryClient.prefetchQuery(getIssueQueryOptions(issue.id));
                  onIssuePrefetch?.(issue.id);
                }}
                to={paths.issue.getHref(issue.id)}
              >
                <p>{issue.title}</p>
            </Link>
            
            {issue.tags && 
            <div className="flex flex-wrap gap-1 mt-1">
              {issue.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs text-nowrap" 
                  style={{
                    ...(tag.color && {
                      backgroundColor: tag.color,
                      color: "#fff",
                      border: "1px solid transparent", 
                    }),
                  }}>
                  {tag.name}
                </Badge>
              ))}
            </div>}
          </div> 
        )
      }
    },
    {
      accessorKey: "description",
      header: "Description",
      meta :{ cellClassName :  "max-w-[40vh] " },
      cell: ({ row }) => {
        const issue = row.original;
        let email = '';
        let name = '';
        
        if(issue.issuer){
          email = issue.issuer.email;
          name = issue.issuer.name;
        }
        const sanitizedContent = DOMPurify.sanitize(issue?.description ?? '');
        
        const [expanded, setExpanded] = useState(false);
        const shortContent = sanitizedContent.length > 100 
          ? sanitizedContent.substring(0, 100) + "..." 
          : sanitizedContent;
    
        return (
          <div className="max-w-xs">
            <div 
              dangerouslySetInnerHTML={{ __html: expanded ? sanitizedContent : shortContent }} 
              className="max-w-xs overflow-hidden text-sm"
            />
            {name && email && <p className='text-xs'>Created By : {name} <span className='text-xs text-gray-600'>{email}</span></p>}
            {sanitizedContent.length > 200 && (
              <Button 
                variant="link"
                className="text-blue-500 text-xs w-full justify-end"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "dueDate",
      header : 'Due Date',
      cell : ({row}) => {
        const issue = row.original;
        if(!issue.dueDate) return '-';
        
        return <span className='text-xs text-nowrap'>{formatDate(issue.dueDate)}</span>
      }
    },
    {
      accessorKey: "createdAt",
      header : 'Created At',
      cell : ({row}) => {
        const issue = row.original;
        if(!issue.createdAt) return '-';
        
        return <span className='text-xs text-nowrap'>{formatDate(issue.createdAt)} <br/>{formatTime(issue.createdAt)}</span>
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

        {issuesQuery.isPending ? 
         <Skeleton className='w-full min-h-[60vh]'/> 
         : issues.length > 0 ?
          <DataTable
            data={issues}
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
            <p className="text-gray-500">No issues found.</p>
          </div>}
          {choosenIssue && choosenIssue.id && (
            <DialogOrDrawer open={isOpen} onOpenChange={toggle} title={"Comments"}>
              <div className="flex flex-col h-[80vh]"> {/* Modal container fills 80% of viewport height */}
                
                <ScrollArea aria-orientation='vertical' className="flex-1 overflow-y-auto">
                  <CommentList 
                    commentableId={choosenIssue.id} 
                    commentableType="issue" 
                    initialComments={choosenIssue.unreadComments ?? []} 
                  />
                </ScrollArea>

                {/* Comment input should stay at the bottom */}
                <div className="p-4 border-t bg-white">
                  <CreateComment commentableId={choosenIssue.id} commentableType="issue" />
                </div>
                
              </div>
            </DialogOrDrawer>
          )}

    </div>
  );
};
