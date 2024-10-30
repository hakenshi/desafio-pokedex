'use client'

import {ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel} from "@tanstack/table-core";
import {flexRender, useReactTable} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "./ui/select";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {PaginationNumbers} from "@/components/PaginationNumbers";
import TypeBadges from "@/components/type-badges";

interface DataTable<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    types: {
        name: string
        url: string
    }[]
    habitats: {
        name: string
        url: string
    }[]
}

export function DataTable<TData, TValue>({columns, data, types, habitats}: DataTable<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const capitalize = (name:string) => name.charAt(0).toUpperCase() + name.slice(1)
    const resetFilters = () => {
        // table.getColumn('name')?.setFilterValue("")
        table.setColumnFilters([])
    }
    return (
        <div className={"border rounded border-zinc-600 overflow-auto max-w-5xl w-full p-5"}>
            <div className={"flex flex-col md:flex-row  gap-2 mb-3"}>
                <Input value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                       onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                       placeholder="Input a pokemon name to search..."/>
                <Select value={(table.getColumn("types")?.getFilterValue() as string) ?? ""} onValueChange={(event) => table.getColumn("types")?.setFilterValue(event)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a pokemon type"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Types</SelectLabel>
                            {types.map(({name}, i) => (
                                <SelectItem value={capitalize(name)}
                                            key={i}>
                                    <TypeBadges type={name}/>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={(table.getColumn("habitat")?.getFilterValue() as string) ?? ""} onValueChange={e => table.getColumn("habitat")?.setFilterValue(e)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a pokemon habitat"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Habitats</SelectLabel>
                            {habitats.map(({name}, i) => (
                                <SelectItem value={capitalize((name))}
                                            key={i}>
                                    {capitalize(name)}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button variant={"ghost"} onClick={() => resetFilters()}>
                    Reset Filters
                </Button>
            </div>
            <Table className={"overflow-auto"}>
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
            <div className={"inline-flex items-center justify-center w-full gap-5"}>
                <Button className={"px-3"} variant={"default"} disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}><ChevronLeft/></Button>
                <PaginationNumbers table={table}/>
                <Button className={"px-3"} variant={"default"} disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}> <ChevronRight/></Button>
            </div>
        </div>
    )
}