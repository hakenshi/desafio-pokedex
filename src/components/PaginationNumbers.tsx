import React, {ReactNode} from "react";
import {PaginationEllipsis, PaginationItem, PaginationLink} from "@/components/ui/pagination";

type PaginationNumbersProps = {
    pageNumber:number;
    totalPages:number;
}

export const PaginationNumbers = ({pageNumber, totalPages}:PaginationNumbersProps) => {
    const items: ReactNode[] = []
    const start = Math.max(1, pageNumber - 2)
    const end = Math.min(totalPages - 1, pageNumber + 2)

    if (start > 1) {
        items.push(
            <PaginationItem key={1}>
            <PaginationLink href="?page=1">
                1
                </PaginationLink>
                </PaginationItem>
        )
    }
    if (start > 4) {
        items.push(
            <PaginationItem key={"ellipsis-start"}>
                <PaginationEllipsis/>
                </PaginationItem>
        )
    }

    for (let i = start; i <= end; i++) {
        items.push(
            <PaginationItem key={i}>
            <PaginationLink isActive={pageNumber === i} href={`?page=${i}`}>
        {i}
        </PaginationLink>
        </PaginationItem>
    )
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            items.push(
                <PaginationItem key={"ellipsis-end"}>
                    <PaginationEllipsis/>
                    </PaginationItem>
            )
        }

        items.push(
            <PaginationItem key={totalPages}>
            <PaginationLink isActive={pageNumber === totalPages} href={`?page=${totalPages}`}>
        {totalPages}
        </PaginationLink>
        </PaginationItem>
    )

    }
    return items
}