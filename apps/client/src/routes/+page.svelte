<script lang="ts">
    import Input from "#lib/components/input/input.svelte";
    import { Skeleton } from "#lib/components/skeleton/index.ts";
    import { categories, list } from "#lib/data/data.remote.ts";
    import { useSearchParams, useDebounce } from "#lib/hooks/hooks.svelte.ts";
    import { CatalogQuery } from "catalog-core";
    import { Effect, Schema } from "effect";
    import { onMount } from "svelte";
    import { Item } from "#lib/components/item/index.ts";
    import * as Select from "#lib/components/select/index.ts";
    import { Button } from "#lib/components/button/index.ts";

    let query = $state<typeof CatalogQuery.Encoded>(
        Schema.encodeSync(CatalogQuery)(new CatalogQuery()),
    );

    const { getParam } = useSearchParams(() => query);

    let queryVersion = 0;

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
        queryVersion += 1;
        query = Schema.encodeSync(CatalogQuery)(new CatalogQuery());
    };

    onMount(() => {
        const q = getParam("query");
        const filter = getParam("filter");
        const sort = getParam("sort");

        if (q || filter || sort) {
            query = Schema.encodeSync(CatalogQuery)(
                new CatalogQuery({
                    query: q?.toString(),
                    filter: filter?.toString(),
                    sort: sort?.toString(),
                }),
            );
        }
    });

    const search = useDebounce(
        (input: { value: string; version: number }) =>
            Effect.sync(() => {
                if (input.version !== queryVersion) {
                    return;
                }
                handleQuery("query", input.value);
            }),
        300,
    );

    const placeholders = Array.from({ length: 8 }, (_, index) => index);
</script>

<div class="container mx-auto px-4 pt-4">
    <h1 class="mb-4 text-4xl sm:text-6xl">Catalog</h1>
    <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <label class="flex w-full flex-col gap-1 text-sm md:max-w-sm">
            Search
            <Input
                class="w-full"
                value={query.query}
                oninput={(e) => {
                    queryVersion += 1;
                    search({
                        value: e.currentTarget.value,
                        version: queryVersion,
                    });
                }}
                placeholder="Search catalog"
            />
        </label>
        <label class="flex w-full flex-col gap-1 text-sm md:w-48">
            Category
            <Select.Root
                type="single"
                value={query.filter}
                onValueChange={(value) => handleQuery("filter", value)}
            >
                <Select.Trigger class="w-full">
                    <Select.Value placeholder="All categories" />
                </Select.Trigger>
                <Select.Content>
                    {#await categories({})}
                        <Select.Item value="loading" disabled
                            >Loading categories</Select.Item
                        >
                    {:then cats}
                        {#each cats as category (category.name)}
                            <Select.Item value={category.name}>
                                {category.name}
                            </Select.Item>
                        {/each}
                    {:catch}
                        <Select.Item value="error" disabled
                            >Categories could not be loaded</Select.Item
                        >
                    {/await}
                </Select.Content>
            </Select.Root>
        </label>
        <label class="flex w-full flex-col gap-1 text-sm md:w-48">
            Sort
            <Select.Root
                type="single"
                value={query.sort}
                onValueChange={(value) => handleQuery("sort", value)}
            >
                <Select.Trigger class="w-full">
                    <Select.Value placeholder="Relevance" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="default">Relevance</Select.Item>
                    <Select.Item value="price">Price</Select.Item>
                </Select.Content>
            </Select.Root>
        </label>
        <Button class="w-full md:w-auto" onclick={() => handleReset()}>
            Clear filters
        </Button>
    </div>
    <div class="mt-4 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {#await list(query)}
            {#each placeholders as index (index)}
                <Skeleton class="h-40 w-full" />
            {/each}
        {:then catalog}
            {#each catalog as result (result.item.id)}
                <Item
                    item={result.item}
                    enrichmentError={result.enrichmentError}
                />
            {:else}
                <p class="sm:col-span-2 xl:col-span-4">No search results.</p>
            {/each}
        {:catch}
            <p
                class="text-destructive sm:col-span-2 xl:col-span-4"
                role="alert"
            >
                Search failed. Check that the API is running and try again.
            </p>
        {/await}
    </div>
</div>
