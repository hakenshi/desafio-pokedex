export type Pokemon = {
    id: number
    name: string
    weight: number
    height: number
    pokedex_entry: string
    habitat: string
    abilities: {
        ability: {
            name: string
            url: string
        }
        is_hidden: boolean
        slot: number
    }[]
    sprites: {
        front_default: string
        other: {
            home: {
                front_default: string
                front_shiny: string
            }
            "official-artwork": {
                front_default: string
                front_shiny: string
            }
        }
    }
    types: {
        slot: number
        type: {
            name: string
            url: string
        }
    }[]
    forms: {
        is_default: boolean
        pokemon: {
            name: string
            url: string
        }
    }[]
} | null

export type PokemonTypes = {
    normal: string
    fire: string
    water: string
    electric: string
    grass: string
    ice: string
    fighting: string
    poison: string
    ground: string
    flying: string
    psychic: string
    bug: string
    rock: string
    ghost: string
    dragon: string
    dark: string
    steel: string
    fairy: string
}