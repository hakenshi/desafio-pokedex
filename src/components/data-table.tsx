'use client'

import {ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel} from "@tanstack/table-core";
import {flexRender, useReactTable} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface DataTable<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({columns, data}: DataTable<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })
    return (
        <>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow className={"p-2"} key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead className={"text-center font-bold"} key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow className={"m-0 p-0"} key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell className={"text-center capitalize text-zinc-200 p-2"} key={cell.id}>
                                        <div className={"flex justify-center"}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No pokemons where found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/*<Button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Previous</Button>*/}
            {/*<Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button>*/}
        </>
    )
}