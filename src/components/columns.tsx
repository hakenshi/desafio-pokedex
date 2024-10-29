'use client'

import {Pokemon} from "@/types/types";
import {ColumnDef} from "@tanstack/table-core";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import TypeBadges from "@/components/type-badges";

export const pokemonColumns: ColumnDef<Pokemon>[] = [
    {
        accessorKey: "id",
        header: "Id"
    },
    {
        accessorKey: "sprite",
        header: "Sprite",
        cell: ({row}) => {
            const pokemon = row.original
            return (
                <Avatar>
                    <AvatarImage src={pokemon?.sprites.front_default} alt={pokemon?.name.replaceAll('-', ' ')}/>
                    <AvatarFallback>
                        {pokemon?.name.replaceAll('-', ' ').substring(0, 2)}
                    </AvatarFallback>
                </Avatar>
            )
        }
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "habitat",
        header: "Habitat",
        cell: ({row}) => {
            return row.original?.habitat ? row.original?.habitat.replaceAll("-", " ") : "No habitat"
        }
    },
    {
        accessorKey: "types",
        header: "Types",
        cell: ({row}) => {
            const types = row.original?.types;
            return (
                <div className={"flex gap-2"}>
                    {types?.map(({type}, i) => (
                        <TypeBadges type={type.name} key={i}/>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: "details",
        header: "Details",
        cell: ({row}) => {
            const pokemon = row.original

            return (
                <Link className={buttonVariants({variant: "default"})} href={`/pokemon/${pokemon?.id}`}>See More</Link>
            )
        }
    }

]