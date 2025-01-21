"use client"

import { 
    ColumnDef as BaseColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable, 
    getPaginationRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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


export function DataTable<TData, TValue>({
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
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const headerClass = header.column.columnDef.meta?.headerClassName || "";
                  return (
                    <TableHead key={header.id} className={headerClass}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {                  
                    const cellClass = cell.column.columnDef.meta?.cellClassName || "";

                    return (
                      <TableCell key={cell.id} className={cellClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       
      {pagination && (
        <DataTablePagination 
          pagination={pagination} 
          onPageChange={onPageChange} />
      )}
    </div>
  )
}

const DataTablePagination = ({ pagination, onPageChange }: { pagination: any, onPageChange: Function }) => {
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