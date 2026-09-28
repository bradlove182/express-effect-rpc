<script lang="ts">
    import Input from "#lib/components/input/input.svelte";
    import { Skeleton } from "#lib/components/skeleton/index.ts";
    import { enrich, list } from "#lib/data/data.remote.ts";
    import { useSearchParams } from "#lib/hooks/hooks.svelte.ts";
    import { CatalogItem, CatalogQuery } from "catalog-core";
    import { Schema } from "effect";
    import { onMount } from "svelte";
    import * as Card from "#lib/components/card/index.ts";
    import { calculateDiscount } from "#lib/utils.ts";
    import { Badge } from "#lib/components/badge/index.ts";
    import { Item } from "#lib/components/item/index.ts";

    let query = $state<CatalogQuery>(
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
</script>

<div class="container mx-auto">
    <h1 class="text-6xl mb-4">Catalog</h1>
    <Input
        value={getParam("query")}
        onkeyup={(e) => {
            query = Schema.encodeSync(CatalogQuery)(
                new CatalogQuery({
                    query: e.currentTarget.value,
                }),
            );
        }}
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
            {/each}
        {:catch error}
            {error.details}
        {/await}
    </div>
</div>
