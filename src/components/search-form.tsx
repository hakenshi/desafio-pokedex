'use client'

import {Input} from "@/components/ui/input";
import {useRouter, useSearchParams} from "next/navigation";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useEffect, useState} from "react";

export default function SearchForm({types, habitats}: {
    types: { name: string; url: string }[];
    habitats: { name: string; url: string }[];
}) {
    const router = useRouter()
    const [pokemonHabitat, setPokemonHabitat] = useState<string | null>(null)
    const [pokemonType, setPokemonType] = useState<string | null>(null)

    const seachParams = useSearchParams()
    const currentPage = seachParams.get("page")

    const updateUrl = (query: string = "") => {
        const params = new URLSearchParams(seachParams.toString())

        if (currentPage) {
            params.set("page", currentPage.toString())
        }

        if (query) {
            params.set("name", query);
        } else {
            params.delete("name");
        }

        if (pokemonType) {
            params.set("type", pokemonType);
        } else {
            params.delete("type");
        }

        if (pokemonHabitat) {
            params.set("habitat", pokemonHabitat);
        } else {
            params.delete("habitat");
        }

        router.push(`?${params.toString()}`);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        updateUrl(query)
    }

    const handleTypeChange = (value: string) => {
        // console.log(value)
        setPokemonType(() => value)
        // updateUrl()
    }

    const handleHabitatChange = (value: string) => {
        setPokemonHabitat(()=> value)
        // updateUrl()
    }

    useEffect(() => {
        updateUrl()
    }, [pokemonHabitat, pokemonType]);

    return (
        <div className={"grid grid-rows-1 grid-cols-1 gap-4"}>
            <Input
                onChange={(e) => handleSearch(e)}
                placeholder="Search for a pokemon name..."/>
            <Select onValueChange={handleTypeChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a type..."/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {types.filter((type) => type.name !== "unknown").map((type, i) => (
                            <SelectItem className={"capitalize"} key={i} value={type.name}>{type.name}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={handleHabitatChange}>
                <SelectTrigger>
                    <SelectValue className={"capitalize"} placeholder="Select a habitat..."/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {habitats.filter((type) => type.name !== "unknown").map((type, i) => (
                            <SelectItem className={"capitalize"} key={i}
                                        value={type.name}>{type.name.replaceAll("-", '  ')}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}