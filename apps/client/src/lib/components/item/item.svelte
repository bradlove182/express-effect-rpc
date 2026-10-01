<script lang="ts">
    import * as Card from "#lib/components/card/index.ts";
    import { enrich } from "#lib/data/data.remote.ts";
    import { CatalogItem } from "catalog-core";
    import { Badge } from "../badge";
    import { calculateDiscount } from "#lib/utils.ts";

    const { item }: { item: CatalogItem } = $props();

    const currencyFormatter = new Intl.NumberFormat("en-ZA", {
        currency: "ZAR",
        style: "currency",
    });

    const percentageFormatter = new Intl.NumberFormat("en-ZA", {
        style: "percent",
    });
</script>

{#snippet ItemTitle(item: CatalogItem)}
    <Card.Action>
        <Badge variant={item.inStock ? "secondary" : "destructive"}>
            {item.inStock ? "In Stock" : "Out Of Stock"}
        </Badge>
        {#if item.discountedPrice}
            <Badge variant="default">
                Save {currencyFormatter.format(
                    item.price - item.discountedPrice,
                )}
            </Badge>
        {/if}
    </Card.Action>
    <Card.Description class="uppercase text-[10px] tracking-wider">
        {item.category}
    </Card.Description>
    <Card.Title>
        {item.name}
    </Card.Title>
    <Card.Description class="text-2xl text-primary">
        {currencyFormatter.format(item.discountedPrice ?? item.price)}
    </Card.Description>
{/snippet}

<Card.Root class="min-h-40 relative">
    <img
        src={item.imageUrl}
        alt={item.name}
        class="relative aspect-video w-full object-cover"
    />
    <Card.Header>
        {#await enrich(item.id)}
            {@render ItemTitle(item)}
        {:then enrichedItem}
            {@render ItemTitle(enrichedItem)}
        {:catch}
            {@render ItemTitle(item)}
        {/await}
    </Card.Header>
</Card.Root>
