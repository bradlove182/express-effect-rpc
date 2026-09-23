<script lang="ts">
    let items = $state<
        Readonly<
            Array<{ id: number; name: string; price: number; category: string }>
        >
    >([]);
    let health = $state<string>("");
    let error = $state<string>("");
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
