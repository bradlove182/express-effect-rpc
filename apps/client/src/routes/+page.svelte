<script lang="ts">
    import { CatalogRpc } from "catalog-core";
    import { Effect } from "effect";
    import { RpcClient } from "effect/unstable/rpc";
    import { onMount } from "svelte";
    import { runRpc } from "../lib/rpc";

    let items = $state<
        Readonly<
            Array<{ id: number; name: string; price: number; category: string }>
        >
    >([]);
    let health = $state<string>("");
    let error = $state<string>("");

    onMount(() => {
        runRpc(
            Effect.gen(function* () {
                const client = yield* RpcClient.make(CatalogRpc);

                const healthRes = yield* client.health();
                health = healthRes.success;

                const catalog = yield* client.getCatalog();
                items = catalog.items;
            }),
        ).catch((cause: unknown) => {
            error = String(cause);
        });
    });
</script>

<div class="prose">
    <h1>Catalog</h1>
    <p>Health: {health}</p>
    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}
    <ul>
        {#each items as item (item.id)}
            <li>{item.name} — ${item.price} ({item.category})</li>
        {/each}
    </ul>
</div>
