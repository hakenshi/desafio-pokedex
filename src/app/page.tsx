import {DataTable} from "@/components/data-table";
import {pokemonColumns} from "@/components/columns";
import { db } from "../../prisma/db";

type PageProps = {
    searchParams: Promise<{
        page?: string
        name?: string
        type?: string
        habitat?: string
    }>
}

export default async function HomePage({searchParams}: PageProps) {

    const {page, name, type, habitat} = await searchParams

    const pokemons = await db.pokemon.findMany()
    const {results:types} = await fetch("https://pokeapi.co/api/v2/type").then(response => response.json())
    const {results:habitats} = await fetch(`https://pokeapi.co/api/v2/pokemon-habitat`).then(response => response.json())

    return (
            <DataTable data={pokemons} columns={pokemonColumns} types={types} habitats={habitats} />
    )
}