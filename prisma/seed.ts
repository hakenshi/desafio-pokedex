import { db } from "./db";
import pLimit from "p-limit";

async function fetchAndStorePokemonData() {
    // Buscar todos os pokemons
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0`;

    const [pokemonResponse, habitatsResponse] = await Promise.all([
        fetch(apiUrl),
        fetch("https://pokeapi.co/api/v2/pokemon-habitat")
    ]);

    const [pokemonData, habitatsData] = await Promise.all([
        pokemonResponse.json(),
        habitatsResponse.json()
    ]);

    const { results: habitats } = habitatsData;

    // Buscar habitats em paralelo
    const pokemonHabitats = await Promise.all(
        habitats.map(async (habitat: { url: string }) => {
            const data = await fetch(habitat.url).then(res => res.json());
            return {
                name: data.name,
                pokemon_species: data.pokemon_species.map(({ name }: { name: string }) => name)
            };
        })
    );

    // Otimizar busca de pokemons com concorrência limitada
    const limit = pLimit(10);
    const fetchPokemons = async (url: string) => {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching Pokémon data from ${url}: ${response.statusText}`);
        }

        const data = await response.json();
        const habitatName = pokemonHabitats.find(({ pokemon_species }) =>
            pokemon_species.includes(data.name)
        )?.name || "unknown";

        return {
            id: data.id,
            name: data.name.replaceAll("-", " "),
            weight: data.weight,
            height: data.height,
            habitat: habitatName,
            types: JSON.stringify(data.types.map((t: any) => t.type.name)),
            sprites: data.sprites.front_default
        };
    };

    // Buscar dados detalhados de todos os pokemons
    const fetchPromises = pokemonData.results
        .map(({ url }: { url: string }) => limit(() => fetchPokemons(url)));

    const results = await Promise.allSettled(fetchPromises);

    const pokemons = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
        .map(result => result.value);

    // Armazenar no banco de dados
    await db.pokemon.createMany({
        data: pokemons,
    });

    console.log(`Stored ${pokemons.length} pokemon in database`);
}

// Executar a função de seed
fetchAndStorePokemonData()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });