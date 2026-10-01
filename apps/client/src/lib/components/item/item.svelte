<script lang="ts">
    import * as Card from "#lib/components/card/index.ts";
    import { CatalogItem } from "catalog-core";
    import { Badge } from "../badge";

    const { item, enrichmentError }: {
        item: CatalogItem
        enrichmentError?: string
    } = $props();

    const currencyFormatter = new Intl.NumberFormat("en-ZA", {
        currency: "ZAR",
        style: "currency",
    });
</script>

<Card.Root class="min-h-40 relative">
    <img
        src={item.imageUrl}
        alt={item.name}
        class="relative aspect-video w-full object-cover"
    />
    <Card.Header>
        <Card.Action>
            {#if item.inStock === true}
                <Badge variant="secondary">In Stock</Badge>
            {:else if item.inStock === false}
                <Badge variant="destructive">Out Of Stock</Badge>
            {/if}
            {#if item.discountedPrice != null && item.discountedPrice < item.price}
                <Badge variant="default">
                    Save {currencyFormatter.format(item.price - item.discountedPrice)}
                </Badge>
            {/if}
        </Card.Action>
        <Card.Description class="uppercase text-[10px] tracking-wider">
            {item.category}
        </Card.Description>
        <Card.Title>
            {item.name}
        </Card.Title>
        <div class="flex flex-col gap-1">
            <Card.Description class="text-2xl text-primary">
                {#if item.discountedPrice != null}
                    <span class="mr-2 text-base text-muted-foreground line-through">
                        {currencyFormatter.format(item.price)}
                    </span>
                    {currencyFormatter.format(item.discountedPrice)}
                {:else}
                    {currencyFormatter.format(item.price)}
                {/if}
            </Card.Description>
            {#if item.deliveryEstimate}
                <Card.Description>Delivery {item.deliveryEstimate}</Card.Description>
            {/if}
            {#if enrichmentError}
                <p class="text-sm text-destructive" role="alert">{enrichmentError}</p>
            {/if}
        </div>
    </Card.Header>
</Card.Root>
