"use client"

import { 
    ColumnDef as BaseColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable, 
    getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
}

type ColumnDef<TData, TValue> = Omit<BaseColumnDef<TData, TValue>, "meta"> & {
  meta?: ColumnMeta;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: {
      currentPage: number;
      perPage: number;
      totalCount: number;
      totalPages: number;
      rootUrl : string;
    },
    onPaginationChange?: (page: number) => void;
}

export function PaginatedList<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), 
    manualPagination: true,
    pageCount: pagination?.totalPages || 0,
  })

  const onPageChange = (page: number) => {
    table.setPageIndex(page - 1);
    onPaginationChange?.(page);
  };

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div key={row.id} className="p-4 border rounded-lg shadow-sm">
              {row.getVisibleCells().map((cell) => {
                const cellClass = cell.column.columnDef.meta?.cellClassName || "";
                return (
                  <div key={cell.id} className={cellClass}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )
              })}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No comments yet.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <ListPaginzation 
          pagination={pagination} 
          onPageChange={onPageChange} />
      )}
    </div>
  )
}

const ListPaginzation = ({ pagination, onPageChange }: { pagination: any, onPageChange: Function }) => {
  const { totalPages, currentPage, rootUrl } = pagination;

  const createHref = (page: number) => `${rootUrl}?page=${page}`;

  const handlePageChange = (page: number, event : React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onPageChange(page);
  };

  return (
    <Pagination className="justify-end py-8">
      <PaginationContent>
        {/* Previous Button */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              href={createHref(currentPage - 1)}
              onClick={(e) => handlePageChange(currentPage - 1, e)}
            />
          </PaginationItem>
        )}
        {/* Ellipsis for skipped pages */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {/* Previous Page Button */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink 
              href={createHref(currentPage - 1)}
              onClick={(e) => handlePageChange(currentPage - 1, e)}
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* Current Page Button */}
        <PaginationItem className="rounded-sm bg-gray-200">
          <PaginationLink  href={createHref(currentPage)} isActive onClick={e => e.preventDefault()}>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        {/* Next Page Button */}
        {totalPages > currentPage && (
          <PaginationItem>
            <PaginationLink 
              href={createHref(currentPage + 1)}
              onClick={(e) => handlePageChange(currentPage + 1, e)}
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* Ellipsis for skipped pages */}
        {totalPages > currentPage + 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {/* Next Button */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext 
              href={createHref(currentPage + 1)}
              onClick={(e) => handlePageChange(currentPage + 1, e)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};