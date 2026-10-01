<script lang="ts">
    import Input from "#lib/components/input/input.svelte";
    import { Skeleton } from "#lib/components/skeleton/index.ts";
    import { categories, list } from "#lib/data/data.remote.ts";
    import { useSearchParams, useDebounce } from "#lib/hooks/hooks.svelte.ts";
    import { CatalogQuery, debounce } from "catalog-core";
    import { Effect, Schema } from "effect";
    import { onMount } from "svelte";
    import { Item } from "#lib/components/item/index.ts";
    import * as Select from "#lib/components/select/index.ts";
    import { Button } from "#lib/components/button/index.ts";

    let query = $state<typeof CatalogQuery.Encoded>(
        Schema.encodeSync(CatalogQuery)(new CatalogQuery()),
    );

    const { getParam } = useSearchParams(() => query);

    $inspect(query);

    const handleQuery = (
        key: keyof CatalogQuery,
        value: CatalogQuery[keyof CatalogQuery],
    ) => {
        query = Schema.encodeSync(CatalogQuery)(
            new CatalogQuery({
                ...query,
                [key]: value,
            }),
        );
    };

    const handleReset = () => {
        query = Schema.encodeSync(CatalogQuery)(new CatalogQuery());
    };

    onMount(() => {
        const q = getParam("query");
        const filter = getParam("filter");

        if (q || filter) {
            query = Schema.encodeSync(CatalogQuery)(
                new CatalogQuery({
                    query: q?.toString(),
                    filter: filter?.toString(),
                }),
            );
        }
    });

    const search = useDebounce(
        (q: string) => Effect.sync(() => handleQuery("query", q)),
        300,
    );
</script>

<div class="container mx-auto pt-4">
    <h1 class="text-6xl mb-4">Catalog</h1>
    <div class="grid grid-cols-12 gap-4">
        <Input
            class="col-span-12 max-w-sm"
            value={query.query}
            onkeyup={(e) => search(e.currentTarget.value)}
            placeholder="Search Catalog"
        />
        <Select.Root
            type="single"
            value={query.filter}
            onValueChange={(value) => handleQuery("filter", value)}
        >
            <Select.Trigger class="w-full col-span-2">
                <Select.Value placeholder="Select a category" />
            </Select.Trigger>
            <Select.Content>
                {#await categories({}) then cats}
                    {#each cats as category}
                        <Select.Item value={category.name}>
                            {category.name}
                        </Select.Item>
                    {/each}
                {/await}
            </Select.Content>
        </Select.Root>
        <Select.Root
            type="single"
            value={query.sort}
            onValueChange={(value) => handleQuery("sort", value)}
        >
            <Select.Trigger class="w-full col-span-2">
                <Select.Value placeholder="Sort catalog" />
            </Select.Trigger>
            <Select.Content>
                <Select.Item value="default">Default</Select.Item>
                <Select.Item value="price">Price</Select.Item>
            </Select.Content>
        </Select.Root>
        <Button class="col-span-1" onclick={() => handleReset()}>
            Clear Filters
        </Button>
    </div>
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
