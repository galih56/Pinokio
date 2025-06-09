"use client"

import type React from "react"
import { useEffect, useState } from "react"

import {
  type ColumnDef as BaseColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea, ScrollBar } from "./scroll-area"

interface ColumnMeta {
  headerClassName?: string
  cellClassName?: string
}

type ColumnDef<TData, TValue> = Omit<BaseColumnDef<TData, TValue>, "meta"> & {
  meta?: ColumnMeta
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: {
    currentPage: number
    perPage: number
    totalCount: number
    totalPages: number
    rootUrl: string
  }
  onPaginationChange?: (page: number) => void
  className?: string
  tableClassName?: string
  minWidth?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  className = "",
  tableClassName = "",
  minWidth = "800px",
}: DataTableProps<TData, TValue>) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 0,
  })

  const onPageChange = (page: number) => {
    table.setPageIndex(page - 1)
    onPaginationChange?.(page)
  }

  // Calculate container width based on screen size
  const containerStyle = isMobile
    ? { width: "100%", maxWidth: "calc(100vw - 2rem)" } // for p-4 dashboard-layout/main
    : { width: "100%", maxWidth: "calc(100vw - 14rem - 2rem)" }

  return (
    <div className={`w-full ${className}`} style={containerStyle}>
      {/* Horizontal scroll container */}
      <div className="relative w-full overflow-hidden rounded-md border">
        <ScrollArea className="w-full">
          <Table
            className={`w-full ${tableClassName}`}
            style={{
              minWidth: isMobile ? "100%" : minWidth,
              width: "100%",
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const headerClass = header.column.columnDef.meta?.headerClassName || ""
                    return (
                      <TableHead key={header.id} className={`${headerClass} whitespace-nowrap`}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => {
                      const cellClass = cell.column.columnDef.meta?.cellClassName || ""
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {pagination && <DataTablePagination pagination={pagination} onPageChange={onPageChange} />}
    </div>
  )
}

const DataTablePagination = ({
  pagination,
  onPageChange,
}: {
  pagination: any
  onPageChange: (page: number) => void
}) => {
  const { totalPages, currentPage, rootUrl } = pagination

  const createHref = (page: number) => `${rootUrl}?page=${page}`

  const handlePageChange = (page: number, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    onPageChange(page)
  }

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
            <PaginationLink href={createHref(currentPage - 1)} onClick={(e) => handlePageChange(currentPage - 1, e)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {/* Current Page Button */}
        <PaginationItem className="rounded-sm bg-gray-200">
          <PaginationLink href={createHref(currentPage)} isActive onClick={(e) => e.preventDefault()}>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        {/* Next Page Button */}
        {totalPages > currentPage && (
          <PaginationItem>
            <PaginationLink href={createHref(currentPage + 1)} onClick={(e) => handlePageChange(currentPage + 1, e)}>
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
            <PaginationNext href={createHref(currentPage + 1)} onClick={(e) => handlePageChange(currentPage + 1, e)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
