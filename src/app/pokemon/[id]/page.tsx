'use client'

import {Button, buttonVariants} from "@/components/ui/button";
import {Pokemon} from "@/types/types";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react"
import {useSearchParams, useRouter, useParams} from "next/navigation";
import {Loader2} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import TypeBadges from "@/components/type-badges";


export default function PokemonPage() {

    const [pokemon, setPokemon] = useState<Pokemon | null>(null)
    const [loading, setIsLoading] = useState<boolean>(true)

    const searchParams = useSearchParams()
    const params = useParams<{id: string}>()
    const router = useRouter()
    const [imageKey, setImageKey] = useState<number>(0)

    const getVariantType: () => string = () => {
        const variantParam = searchParams.get("variant") as 'shiny'
        return pokemon?.sprites.other.home[`front_${variantParam}`] || ""
    }

    const getPokedexEntry = (entries: any[]) => {
        const entry = entries.find(e => e.language.name === "en")
        const entryText = entry.flavor_text.replace(/\s+/g, " ").charAt(0).toUpperCase() + entry.flavor_text.replace(/\s+/g, " ").slice(1)
        return entry ? entryText : "Descrição indisponível"
    }

    const getPokemonForm = (name: string) => {

        if (name.includes('gmax')) {
            return 'Gigantamax'
        }

        const forms = name.split('-')
        const formNames = forms.filter(formName => formName.includes('mega'))
        if (formNames.length > 0) {
            return formNames.map((_, index) => `Mega ${forms[index + 2]}`).join(' ')
        }
        if (formNames.length === 1) return formNames[0]
        if (name.includes('-')) {
            return name.split('-')[1];
        }

        return 'Default'
    }

    useEffect(() => {
        const fetchPokemon = async () => {
            const baseUrl = searchParams.get("form") ? `https://pokeapi.co/api/v2/pokemon/${searchParams.get("form")}` : `https://pokeapi.co/api/v2/pokemon/${params.id}`
            const response = await fetch(baseUrl)
            const pokemonData = await response.json()
            const species = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${params.id}`)
            const speciesData = await species.json()
            return {
                pokemon: pokemonData,
                species: speciesData,
            }
        }
        fetchPokemon().then(({pokemon, species}) => {
            setPokemon({
                ...pokemon,
                pokedex_entry: getPokedexEntry(species.flavor_text_entries),
                forms: species.varieties
            })
            setIsLoading(false)
        })
    }, [params.id, searchParams])

    const updatePokemon = useCallback(async (id: string) => {
        setImageKey(i => i + 1)
        const newUrl = searchParams.get('variant') ? `?variant=${searchParams.get('variant')}&form=${id}` : `?form=${id}`
        router.push(newUrl)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const pokemonData = await response.json()

        setPokemon(p => ({
            ...p,
            name: pokemonData.name,
            height: pokemonData.height,
            abilities: pokemonData.abilities,
            sprites: {
                other: {
                    home: pokemonData.sprites.other.home
                }
            },
            types: pokemonData.types
        } as Pokemon))
    }, [router, searchParams])


    return (
        <div
            className="grid grid-cols-[0.7fr_1fr_] grid-rows-[1fr] gap-5 p-5 max-w-5xl w-full rounded-3xl h-[36rem] border-2 border-zinc-700/50 bg-zinc-800">
            <AnimatePresence>
                {pokemon && !loading ? (
                    <>
                        <motion.div
                            className="bg-zinc-600 rounded-3xl shadow-lg shadow-zinc-800 flex flex-col items-center justify-evenly"
                            initial={{opacity: 0, scale: 0.8}} // Início da animação
                            animate={{opacity: 1, scale: 1}} // Estado final da animação
                            exit={{opacity: 0, scale: 0}} // Estado de saída
                            transition={{duration: 0.3}} // Duração da animação
                        >
                            <motion.img
                                key={imageKey}
                                width={300}
                                height={300}
                                src={!getVariantType() ? pokemon?.sprites.other.home.front_default : getVariantType()}
                                alt={pokemon.name.replaceAll('-', ' ')}
                                initial={{opacity: 0,}}
                                animate={{opacity: 1,}}
                                exit={{opacity: 0,}}
                                transition={{duration: 0.5}}
                            />
                            <div className="inline-flex justify-center gap-10">
                                <Link onClick={() => setImageKey(i => i + 1)}
                                      className={`${buttonVariants({variant: "default"})} bg-red-500 text-white hover:bg-red-600`}
                                      href={`?form=${pokemon.id}`}>Base</Link>
                                <Link onClick={() => setImageKey(i => i + 1)}
                                      className={buttonVariants({variant: "default"})}
                                      href={searchParams.get('form') ? `?variant=shiny&form=${pokemon.id}` : "?variant=shiny"}>Shiny</Link>
                            </div>
                        </motion.div>
                        <motion.div
                            className={`px-4 py-2 border-2 rounded-3xl border-zinc-600 grid`}
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0}}
                            transition={{duration: 0.3}}
                        >
                            <ul className="p-5 flex flex-col justify-center gap-3 text-xl">
                                <li className="capitalize font-bold text-3xl text-center mb-2">
                                    <span>{pokemon.name} #{pokemon.id}</span>
                                </li>
                                <li>Weight: {pokemon.weight / 100}kg</li>
                                <li>Height: {pokemon.height / 10}m</li>
                                <li className={"flex gap-2"}>
                                    <p>Types:</p>
                                    {pokemon.types.map(({type}, i: number) => (
                                        <TypeBadges type={type.name} key={i} />
                                    ))}
                                </li>
                                <li className={"flex"}>
                                    Abilities: {pokemon.abilities.map(({ability, slot}) => (
                                    <p className={"capitalize px-1"} key={slot}>{ability.name.replaceAll('-', ' ')}</p>
                                ))}
                                </li>
                                <li className={"first-letter:uppercase"}>
                                    Pokedex Entry: {pokemon.pokedex_entry}
                                </li>
                            </ul>
                            <div className={"flex gap-10 justify-center items-center h-[69%]"}>
                                {pokemon.forms.length > 1 && pokemon.forms.map((form, i) => {
                                    const formName = getPokemonForm(form.pokemon.name);
                                    const id = form.pokemon.url.split('/')[6];

                                    const formClass = () => {
                                        if (formName === "Gigantamax") {
                                            return 'bg-dyanamax text-white hover:drop-shadow-dynamax border-[#D42368]'
                                        } else if (formName.includes("Mega")) {
                                            return 'bg-mega text-white hover:drop-shadow-mega border-[#299CCD]'
                                        }
                                        return ""
                                    }

                                    return (
                                        <Button key={i} onClick={() => updatePokemon(id)}
                                                className={`capitalize ${formClass()}`}>
                                            {formName}
                                        </Button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <div>
                        <div className="flex justify-center items-center w-full h-full">
                            <Loader2 className={"text-white h-12 w-12 animate-spin"}/>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
