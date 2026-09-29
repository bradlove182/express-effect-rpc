<script lang="ts">
    import Input from "#lib/components/input/input.svelte";
    import { Skeleton } from "#lib/components/skeleton/index.ts";
    import { list } from "#lib/data/data.remote.ts";
    import { useSearchParams, useDebounce } from "#lib/hooks/hooks.svelte.ts";
    import { CatalogQuery, debounce } from "catalog-core";
    import { Effect, Schema } from "effect";
    import { onMount } from "svelte";
    import { Item } from "#lib/components/item/index.ts";
    import type { KeyboardEventHandler } from "svelte/elements";

    let query = $state<typeof CatalogQuery.Encoded>(
        Schema.encodeSync(CatalogQuery)(new CatalogQuery()),
    );

    const { getParam } = useSearchParams(() => query);

    onMount(() => {
        const q = getParam("query");

        if (q) {
            query = Schema.encodeSync(CatalogQuery)(
                new CatalogQuery({
                    query: q.toString(),
                }),
            );
        }
    });

    const search = useDebounce(
        (q: string) =>
            Effect.sync(() => {
                query = Schema.encodeSync(CatalogQuery)(
                    new CatalogQuery({ query: q }),
                );
            }),
        300,
    );
</script>

<div class="container mx-auto">
    <h1 class="text-6xl mb-4">Catalog</h1>
    <Input
        value={getParam("query")}
        onkeyup={(e) => search(e.currentTarget.value)}
        placeholder="Search Catalog"
    />
    <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
        {#await list(query)}
            {#each Array.from({ length: 10 }) as _}
                <Skeleton class="w-full h-40" />
            {/each}
        {:then catalog}
            {#each catalog as item (item.id)}
                <Item {item} />
            {:else}
                <div class="col-span-4">No search results.</div>
            {/each}
        {:catch error}
            {error.details}
        {/await}
    </div>
</div>
