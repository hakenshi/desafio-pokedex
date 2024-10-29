import {DataTable} from "@/components/data-table";
import {pokemonColumns} from "@/components/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import SearchForm from "@/components/search-form";
import {Pokemon} from "@/types/types";
import pLimit from "p-limit";
import {PaginationNumbers} from "@/components/PaginationNumbers";
import Link from "next/link";

type PageProps = {
    searchParams: Promise<{
        page?: string
        name?: string
        type?: string
        habitat?: string
    }>
}

const PER_PAGE_LIMIT = 20;

async function getPokemonData(page: number, name?: string, typeName?: string, pokemonHabitat?: string): Promise<{
    pokemons: Pokemon[];
    count: number;
    types: { name: string; url: string }[];
    habitats: { name: string; url: string }[]
}> {
    "use server";
    const offset = Math.min(Math.max(page * PER_PAGE_LIMIT, 0), 1015)

    const pageLimit = name || pokemonHabitat || typeName ? 1025 : PER_PAGE_LIMIT
    const CONCURRENCY_LIMIT = name ? 25 : 5;
    const limit = pLimit(CONCURRENCY_LIMIT);

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageLimit}&offset=${offset}`);
    const data = await response.json();

    const {results: types} = await fetch("https://pokeapi.co/api/v2/type").then((response) => response.json());
    const {results: habitats} = await fetch("https://pokeapi.co/api/v2/pokemon-habitat").then((response) => response.json());

    const pokemonHabitats = await Promise.all(
        habitats.map(
            async (habitat: { url: string }) => {
                const data = await fetch(habitat.url)
                    .then((response) => response.json())

                return {
                    name: data.name,
                    pokemon_species: data.pokemon_species.map(({name}: { name: string }) => name),
                }
            }
        )
    )

    const fetchPokemons = async (url: string) => {
        const pokemonData = await fetch(url);

        if (!pokemonData.ok) {
            throw new Error(
                `Error fetching Pokémon data from ${url}: ${pokemonData.statusText}`
            );
        }

        const data = await pokemonData.json();

        const habitatName = pokemonHabitats.find(({pokemon_species}) => pokemon_species.includes(data.name))?.name

        return {
            id: data.id,
            name: data.name.replaceAll("-", " "),
            weight: data.weight,
            height: data.height,
            habitat: habitatName,
            types: [...data.types],
            sprites: {
                front_default: data.sprites.front_default,
            },
        };
    };

    const fetchPromises = data.results.map(({url}: { url: string }) => limit(() => fetchPokemons(url)))

    const results = await Promise.allSettled(fetchPromises);

    let pokemons: Pokemon[] = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<Pokemon>).value);

    if (name) {
        pokemons = pokemons.filter(pokemon => pokemon?.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (pokemonHabitat) {
        pokemons = pokemons.filter(pokemon => pokemon?.habitat?.includes(pokemonHabitat));
    }
    if (typeName){
        pokemons = pokemons.filter(pokemon => pokemon?.types.find(({type}) => type.name.includes(typeName)))
    }

    return {pokemons, count: data.count, types, habitats};
}

export default async function HomePage({searchParams}: PageProps) {

    const {page, name, type, habitat} = await searchParams

    const pageNumber = parseInt(page || '1')

    const {pokemons, count, habitats, types} = await getPokemonData(pageNumber - 1, name, type, habitat)
    const pageLimit = name || habitat || type ? pokemons.length : PER_PAGE_LIMIT

    const totalPages = Math.min(Math.max(Math.ceil(count / pageLimit), 1), 53)

    const url = (number: number) => {
        if (type) {
            return `?page=${number}&type=${type}`
        } else if (habitat) {
            return `?page=${number}&habitat=${habitat}`
        } else if (habitat && type) {
            return `?page=${number}&type=${type}&habitat=${habitat}`
        }
        return `?page=${number}`
    }

    return (
        <div className={"border rounded border-zinc-600 max-w-5xl w-full m-5 p-5"}>
            <SearchForm types={types} habitats={habitats}/>
            <DataTable data={pokemons} columns={pokemonColumns}/>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Link href={url(pageNumber - 1)}>
                        Previous
                        </Link>
                    </PaginationItem>
                    <PaginationNumbers pageNumber={pageNumber} totalPages={totalPages}/>
                    <PaginationItem>
                        <Link href={url(pageNumber + 1)}>
                            Next
                        </Link>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
