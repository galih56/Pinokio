import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Issue } from "@/types/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, SaveIcon, Undo2Icon } from "lucide-react";
import { Link } from "@/components/ui/link";
import { paths } from "@/apps/issue-tracker/paths";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { usePublicIssues } from "../api/get-public-issues";
import { formatDate, formatTime } from "@/lib/datetime";
import { StatusBadge } from "@/components/ui/status-badge";
import { GuestIssuerInputs } from "./guest-issuer-inputs";
import useGuestIssuerStore from "@/store/useGuestIssuer";
import DialogOrDrawer from "@/components/layout/dialog-or-drawer";
import { isValidEmail } from "@/lib/common";
import { getPublicIssueQueryOptions } from "../api/get-public-issue";
import { cn } from "@/lib/utils";

export type PublicIssuesProps = {
  onIssuePrefetch?: (id: string) => void;
};

export const PublicIssues = ({ onIssuePrefetch }: PublicIssuesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";

  const { name, email } = useGuestIssuerStore();
  const [searchTerm, setSearchTerm] = useState(search);
  const isIdentityEmpty = !(name && email);
  const [showDialog, setShowDialog] = useState(isIdentityEmpty);
  const [guestIssuerInfoSaved, setGuestIssuerInfoSaved] = useState(!isIdentityEmpty);

  // Ensure query only runs when name & email are confirmed
  const issuerInfo = guestIssuerInfoSaved ? { name, email } : null;

  const issuesQuery = usePublicIssues({
    page: currentPage,
    search,
    issuer: issuerInfo,
    queryConfig: {
      enabled: !!issuerInfo, // Ensures fetch happens only after confirmation
    },
  });

  const issues = issuesQuery.data?.data || [];
  const meta = issuesQuery.data?.meta;

  const handleFetchIssues = () => {
    if (name && isValidEmail(email)) {
      setGuestIssuerInfoSaved(true); // Enable query only after confirming details
      setShowDialog(false);
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
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => <span className="text-xs text-nowrap">{formatDate(row.original.dueDate) || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span className="text-xs text-nowrap">
          {formatDate(row.original.createdAt)} <br />
          {formatTime(row.original.createdAt)}
        </span>
      ),
    },
  ];

  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(["issues", { page: newPage }], issuesQuery.data);
    navigate(`?page=${newPage}`);
    issuesQuery.refetch();
  };

  const BackToLoginLink = () => (
    <a href={import.meta.env.VITE_BASE_URL + "/auth/login"} className={cn(buttonVariants({ variant: "ghost" }))}>
      <Undo2Icon className="mr-2 h-4 w-4" />
      Back to Login Page
    </a>
  );

  if (isIdentityEmpty || !guestIssuerInfoSaved) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <Button onClick={() => setShowDialog(true)}>Please tell us your name and email</Button>

        <DialogOrDrawer
          open={showDialog}
          onOpenChange={setShowDialog}
          title="Enter Your Details"
          description="Please enter your name and email to continue."
          scrollAreaClassName="h-[35vh] px-6"
        >
          <GuestIssuerInputs />
          <Button className="mt-4" onClick={handleFetchIssues}>
            <SaveIcon /> Save
          </Button>
          <BackToLoginLink />
        </DialogOrDrawer>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {!isIdentityEmpty && (
        <div className="flex flex-col space-y-1.5 p-6 text-center">
          <div className="font-semibold leading-none tracking-tight">{name}</div>
          <div className="text-sm text-muted-foreground">{email}</div>
        </div>
      )}

      <div className="mb-4">
        <Input type="text" placeholder="Search issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {issuesQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : issues.length > 0 ? (
        <DataTable data={issues} columns={columns} pagination={{ totalPages: meta?.totalPages, currentPage: meta?.currentPage, onPageChange }} />
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No issues found.</p>
        </div>
      )}
    </div>
  );
};
