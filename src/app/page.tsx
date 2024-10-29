import {DataTable} from "@/components/data-table";
import {pokemonColumns} from "@/components/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
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
    
    // Aplicar filtros na URL da API para reduzir dados transferidos
    let apiUrl = `https://pokeapi.co/api/v2/pokemon`;
    
    if (name || typeName || pokemonHabitat) {
        // Se houver filtros, buscar todos para filtrar no servidor
        const offset = 0;
        const limit = 1025;
        apiUrl += `?limit=${limit}&offset=${offset}`;
    } else {
        // Se não houver filtros, usar paginação normal
        const offset = Math.min(Math.max(page * PER_PAGE_LIMIT, 0), 1015);
        apiUrl += `?limit=${PER_PAGE_LIMIT}&offset=${offset}`;
    }

    const [pokemonResponse, typesResponse, habitatsResponse] = await Promise.all([
        fetch(apiUrl, {
            next: { revalidate: 3600 }
        }),
        fetch("https://pokeapi.co/api/v2/type", {
            next: { revalidate: 86400 }
        }),
        fetch("https://pokeapi.co/api/v2/pokemon-habitat", {
            next: { revalidate: 86400 }
        })
    ]);

    const [pokemonData, typesData, habitatsData] = await Promise.all([
        pokemonResponse.json(),
        typesResponse.json(),
        habitatsResponse.json()
    ]);

    const {results: types} = typesData;
    const {results: habitats} = habitatsData;

    // Buscar habitats em paralelo
    const pokemonHabitats = await Promise.all(
        habitats.map(async (habitat: { url: string }) => {
            const data = await fetch(habitat.url, {
                next: { revalidate: 86400 }
            }).then(res => res.json());

            return {
                name: data.name,
                pokemon_species: data.pokemon_species.map(({name}: { name: string }) => name)
            };
        })
    );

    // Otimizar busca de pokemons com concorrência limitada
    const limit = pLimit(10);
    const fetchPokemons = async (url: string) => {
        const response = await fetch(url, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Error fetching Pokémon data from ${url}: ${response.statusText}`);
        }

        const data = await response.json();
        const habitatName = pokemonHabitats.find(({pokemon_species}) => 
            pokemon_species.includes(data.name)
        )?.name;

        return {
            id: data.id,
            name: data.name.replaceAll("-", " "),
            weight: data.weight,
            height: data.height,
            habitat: habitatName,
            types: data.types,
            sprites: {
                front_default: data.sprites.front_default,
            }
        };
    };

    // Filtrar resultados antes de fazer fetch detalhado
    let filteredResults = pokemonData.results;
    
    if (name) {
        filteredResults = filteredResults.filter(pokemon => 
            pokemon.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    // Buscar dados detalhados apenas dos pokemons filtrados
    const fetchPromises = filteredResults
        .map(({url}) => limit(() => fetchPokemons(url)));

    const results = await Promise.allSettled(fetchPromises);
    
    let pokemons: Pokemon[] = results
        .filter((result): result is PromiseFulfilledResult<Pokemon> => result.status === "fulfilled")
        .map(result => result.value);

    // Aplicar filtros restantes
    if (pokemonHabitat) {
        pokemons = pokemons.filter(pokemon => pokemon?.habitat?.includes(pokemonHabitat));
    }
    if (typeName) {
        pokemons = pokemons.filter(pokemon => 
            pokemon?.types.some(({type}) => type.name.includes(typeName))
        );
    }

    return {
        pokemons: pokemons.slice(page * PER_PAGE_LIMIT, (page + 1) * PER_PAGE_LIMIT),
        count: pokemonData.count,
        types,
        habitats
    };
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
