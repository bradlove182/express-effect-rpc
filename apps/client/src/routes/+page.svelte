<script lang="ts">
    import Input from "#lib/components/input/input.svelte";
    import { enrich, list } from "#lib/data/data.remote.ts";
    import { useSearchParams } from "#lib/hooks/hooks.svelte.ts";
    import { CatalogQuery } from "catalog-core";
    import { Schema } from "effect";
    import { onMount } from "svelte";

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
    <h1>Catalog</h1>
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
    {#await list(query)}
        loading...
    {:then catalog}
        {#each catalog as item (item.id)}
            <div>
                {#await enrich(item.id)}
                    {item.name} - {item.price}
                {:then enrichedItem}
                    {enrichedItem.name} - {enrichedItem.discountedPrice}
                {:catch}
                    {item.name} - {item.price}
                {/await}
            </div>
        {/each}
    {:catch error}
        {error.details}
    {/await}
</div>
