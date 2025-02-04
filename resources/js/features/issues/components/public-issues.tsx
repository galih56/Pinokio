import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Issue } from "@/types/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, SaveIcon } from "lucide-react";
import { Link } from "@/components/ui/link";
import { paths } from "@/apps/issue-tracker/paths";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { usePublicIssues } from "../api/get-public-issues";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { StatusBadge } from "./status-badge";
import { GuestIssuerInputs } from "./guest-issuer-inputs";
import useGuestIssuerStore from "@/store/useGuestIssuer";
import DialogOrDrawer from "@/components/layout/dialog-or-drawer";
import { isValidEmail } from "@/lib/common";
import { getPublicIssueQueryOptions } from "../api/get-public-issue";
import DOMPurify from 'dompurify';

export type PublicIssuesProps = {
  onIssuePrefetch?: (id: string) => void;
};

export const PublicIssues = ({ onIssuePrefetch }: PublicIssuesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";

  const { name, email } = useGuestIssuerStore();
  const [searchTerm, setSearchTerm] = useState(search);
  const isIdentityEmpty = !(name && isValidEmail(email));
  const [showDialog, setShowDialog] = useState(isIdentityEmpty); // Show dialog if user data is missing

  const [guestIssuerInfoSaved, setGuestIssuerInfoSaved] = useState(!isIdentityEmpty); // Flag to trigger fetching, if the name and email are already filled on initial load, we don't need to input the name and email

  const queryClient = useQueryClient();

  const issuesQuery = usePublicIssues({
    page: currentPage,
    search,
    queryConfig: {
      enabled: guestIssuerInfoSaved && !isIdentityEmpty, // Fetch only when triggered and valid user info
    },
  });

  const issues = issuesQuery.data?.data || [];
  const meta = issuesQuery.data?.meta;

  const handleFetchIssues = () => {
    if (name && isValidEmail(email)) {
      setGuestIssuerInfoSaved(true); // Trigger fetching if name and email are valid
      setShowDialog(false); // Close the dialog
    } else {
      alert("Please enter a valid name and email.");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        return params;
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, setSearchParams]);

  const columns: ColumnDef<Issue>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const issue = row.original;
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
                  queryClient.prefetchQuery(getPublicIssueQueryOptions(issue.id));
                  onIssuePrefetch?.(issue.id);
                }}
                to={paths.issue.getHref(issue.id)}
              >
                <DropdownMenuItem>View</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
    },{
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const issue = row.original;
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
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const issue = row.original;
        if (!issue.dueDate) return "-";
        return formatDate(issue.dueDate);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const issue = row.original;
        if (!issue.createdAt) return "-";
        return formatDateTime(issue.createdAt);
      },
    },
  ];

  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(["issues", { page: newPage }], issuesQuery.data);
    navigate(`?page=${newPage}`);
    issuesQuery.refetch();
  };

  if (isIdentityEmpty || !guestIssuerInfoSaved) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <Button onClick={() => setShowDialog(true)}>Please tell us your name and email</Button>
        
        <DialogOrDrawer
          open={showDialog}
          onOpenChange={setShowDialog}
          title={"Enter Your Details"}
          description={"Please enter your name and email to continue."}
          scrollAreaClassName="h-[35vh] px-6"
        >
          <GuestIssuerInputs />
          {/* Button to trigger fetching */}
          <Button className="mt-4" onClick={handleFetchIssues}>
            <SaveIcon/> Save 
          </Button>
        </DialogOrDrawer>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      
      <DialogOrDrawer
        open={showDialog}
        onOpenChange={setShowDialog}
        title={"Enter Your Details"}
        description={"Please enter your name and email to continue."}
        scrollAreaClassName="h-[35vh] px-6"
      >
        <GuestIssuerInputs />
        {/* Button to trigger fetching */}
        <Button className="mt-4" onClick={handleFetchIssues}>
          <SaveIcon/> Save 
        </Button>
      </DialogOrDrawer>

      {!isIdentityEmpty &&
      <div className="flex flex-col space-y-1.5 p-6 text-center">
        <div className="font-semibold leading-none tracking-tight">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>}
      
      {/* Search bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Data table */}
      {issuesQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : issues.length > 0 ? (
        <DataTable
          data={issues}
          columns={columns}
          pagination={
            meta && {
              totalPages: meta.totalPages,
              perPage: meta.perPage,
              totalCount: meta.totalCount,
              currentPage: meta.currentPage,
              rootUrl: "",
            }
          }
          onPaginationChange={onPageChange}
        />
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No issues found.</p>
        </div>
      )}
    </div>
  );
};
