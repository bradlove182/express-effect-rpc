<script lang="ts">
    import "./layout.css";
    import favicon from "#lib/assets/favicon.svg";
    import { onMount } from "svelte";
    import { Effect } from "effect";
    import { apiClient } from "catalog-core";
    import { useApiClient } from "../lib/hooks.svelte";
    import { runPromise } from "effect/Effect";

    let { children } = $props();

    const { client } = useApiClient();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#await Effect.runPromise(client.health()) then response}
    {response}
{/await}

{@render children()}
