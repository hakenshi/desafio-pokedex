import React, { ReactNode } from "react";
import { PaginationEllipsis } from "@/components/ui/pagination";
import { Table } from "@tanstack/table-core";
import { Button } from "@/components/ui/button";

type PaginationNumbersProps<TData> = {
    table: Table<TData>;
};

export const PaginationNumbers = ({ table }: PaginationNumbersProps<any>) => {
    const items: ReactNode[] = [];

    // Get pagination state from the table
    const pageNumber = table.getState().pagination.pageIndex + 1; // 1-based index for display
    const totalPages = table.getPageCount(); // Total pages

    const start = Math.max(1, pageNumber - 2); // Start range
    const end = Math.min(totalPages, pageNumber + 2); // End range

    // First page button
    if (start > 1) {
        items.push(
            <Button key={1} variant={"default"} onClick={() => table.setPageIndex(0)}>
                1
            </Button>
        );
    }

    // Ellipsis before current range
    if (start > 2) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    // Page buttons within range
    for (let i = start; i <= end; i++) {
        items.push(
            <Button
                key={i}
                className={pageNumber === i ? "active" : ""}
                variant={'default'}
                onClick={() => table.setPageIndex(i - 1)}
            >
                {i}
            </Button>
        );
    }

    // Ellipsis after current range
    if (end < totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    // Last page button
    if (end < totalPages) {
        if (end < totalPages - 1){
            items.push(
                <Button
                    key={totalPages}
                    variant={"default"}
                    onClick={() => table.setPageIndex(totalPages - 1)}
                >
                    {totalPages}
                </Button>
            );
        }
    }

    return <div className="inline-flex items-center gap-2">{items}</div>;
};
