import {PokemonTypes} from "@/types/types";
import {Badge} from "@/components/ui/badge";

const pokemonTypeColors: PokemonTypes = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-cyan-300",
    fighting: "bg-red-600",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-stone-500",
    ghost: "bg-indigo-800",
    dragon: "bg-indigo-700",
    dark: "bg-gray-700",
    steel: "bg-gray-500",
    fairy: "bg-pink-300"
};

export default function TypeBadges({type}:{type:string}){

    return (
        <Badge
            variant={"default"}
            className={`capitalize ${pokemonTypeColors[type as keyof PokemonTypes]} hover:${pokemonTypeColors[type as keyof PokemonTypes]}/50 text-white`}
        >
            {type}
        </Badge>
    )
}