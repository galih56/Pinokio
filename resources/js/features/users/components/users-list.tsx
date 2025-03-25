import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUsers } from "../api/get-users";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@/components/ui/link";
import { paths } from "@/apps/dashboard/paths";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalizeFirstChar } from "@/lib/common";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/datetime";
import { VariantType } from "@/types/ui";
import { queryClient } from "@/lib/react-query";
import { useDisclosure } from "@/hooks/use-disclosure";
import { UserDialog } from "./user-dialog";

export function UsersList() {
  const navigate = useNavigate();
  const { close, isOpen, open, toggle } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = +(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";

  const usersQuery = useUsers({ page: currentPage, search });
  const users = usersQuery.data?.data;
  const meta = usersQuery.data?.meta;

  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (searchTerm) params.set("search", searchTerm);
        else params.delete("search");
        return params;
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, setSearchParams]);

  const columns: ColumnDef<User>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user);
                open();
              }}>
                View / Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      meta : {
        headerClassName : 'text-center',
        cellClassName : 'text-center',
      },
      cell: ({ row }) => {
        const user = row.original;
        if (!user.role) return "";

        let badgeVariant: VariantType = "info";
        switch (user?.role.code) {
          case "HR":
            badgeVariant = "warning";
            break;
          case "ADMIN":
            badgeVariant = "destructive";
            break;
          default:
            break;
        }
        return <Badge variant={badgeVariant}>{capitalizeFirstChar(user.role.name)}</Badge>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (row.original.updatedAt ? formatDateTime(row.original.updatedAt) : "-"),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (row.original.createdAt ? formatDateTime(row.original.createdAt) : "-"),
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {usersQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : users?.length ? (
        <DataTable
          data={users}
          columns={columns}
          pagination={meta && {
            totalPages: meta.totalPages,
            perPage: meta.perPage,
            totalCount: meta.totalCount,
            currentPage: meta.currentPage,
            rootUrl: "",
          }}
          onPaginationChange={(newPage) => {
            navigate(`?page=${newPage}`);
            usersQuery.refetch();
          }}
        />
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}

      <UserDialog user={selectedUser} open={isOpen} onOpenChange={toggle} />
    </div>
  );
}
