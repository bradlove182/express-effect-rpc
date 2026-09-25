<script lang="ts">
    import { useApiClient } from "#lib/hooks.svelte.ts";
    import { CatalogQuery } from "catalog-core";
    import { Effect } from "effect";

    const { client } = useApiClient();

    const query = $state<CatalogQuery>(new CatalogQuery());
</script>

<div class="prose">
    <h1>Catalog</h1>
    {#await Effect.runPromise(client.list({ query }))}
        loading...
    {:then catalog}
        {#each catalog as item (item.id)}
            {item.name}
        {/each}
    {/await}
</div>
