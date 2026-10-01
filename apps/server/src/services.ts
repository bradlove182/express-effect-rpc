import { CatalogItem, CatalogItemNotFound, CatalogQuery, CatalogSearchResult, EnrichmentServiceUnavailable, maybeSuccessWithDelay, normalize, CatalogCategory } from "catalog-core";
import { Context, Effect, String, pipe, Array, Order, Layer, Random } from "effect";

function quoteFromRandom(item: CatalogItem, random: number) {
    const low = 20 + Math.round(random * 25)

    return new CatalogItem({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        discountedPrice: item.price * random,
        inStock: random > 0.5,
        deliveryEstimate: `${low}–${low + 15} min`,
    })
}

const liveQuote = (item: CatalogItem) =>
    Effect.gen(function* () {
        const random = yield* Random.next
        const success = yield* maybeSuccessWithDelay(500)

        if (!success) {
            return new CatalogSearchResult({
                item,
                enrichmentError: "Live price and availability are unavailable.",
            })
        }

        return new CatalogSearchResult({
            item: quoteFromRandom(item, random),
        })
    })

function rank(items: CatalogItem[], query: string) {
    const tokens = pipe(
        query,
        normalize,
        String.split(/\s+/),
        Array.filter(Boolean)
    )

    return pipe(
        items,
        Array.map(item => {
            const fields = pipe(
                [item.name, item.category],
                Array.map(normalize)
            )

            let score = 0

            for (const token of tokens) {
                const hit = fields.some(field => field.includes(token))

                if (!hit) {
                    return undefined
                }

                for (const field of fields) {
                    if (field === token) {
                        score += 3
                    } else if (field.startsWith(token)) {
                        score += 2
                    } else if (field.includes(token)) {
                        score +=1
                    }
                }
            }

            return {item, score}
        }),
        Array.filter(Boolean),
        // It is ok to assert the the existence here because we filtered out any undefined values
        Array.sortBy((a, b) => Order.Number(b!.score, a!.score) || Order.String(a!.item.name, b!.item.name)),
        Array.map(item => item!.item)
    )
}

export class CatalogService extends Context.Service<
    CatalogService,
    {
        getById: (items: CatalogItem[], id: CatalogItem["id"]) => Effect.Effect<CatalogItem, CatalogItemNotFound>,
        search: (items: CatalogItem[], query: CatalogQuery) => Effect.Effect<CatalogSearchResult[]>,
        enrichById: (items: CatalogItem[], id: CatalogItem["id"]) => Effect.Effect<CatalogItem, EnrichmentServiceUnavailable | CatalogItemNotFound>,
        categories: (items: CatalogItem[]) => Effect.Effect<CatalogCategory[]>
    }
>()(
    "apps/server/src/services/CatalogService",
    {
        make: Effect.succeed({
            getById: (items, id) => {
                return Effect.gen(function*() {
                    const item = items.find((item) => item.id === id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${id} not found.` })
                    }

                    return item
                })
            },
            search: (items, query) => {
                return Effect.gen(function*() {
                    const filtered = pipe(
                        items,
                        Array.filter(item => !query.filter || item.category === query.filter)
                    )

                    const ranked = query.query ? rank(filtered, query.query) : filtered
                    const ordered = query.sort === "price"
                        ? pipe(
                            ranked,
                            Array.sort(Order.mapInput(Order.Number, (item: CatalogItem) => item.price)),
                        )
                        : ranked

                    return yield* Effect.forEach(ordered, liveQuote, { concurrency: "unbounded" })
                })
            },
            enrichById: (items, id) => {
                return Effect.gen(function*() {
                    const item = items.find(curr => curr.id === id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${id} not found.` })
                    }

                    const random = yield* Random.next
                    const success = yield* maybeSuccessWithDelay(500)

                    if (!success) {
                        return yield* new EnrichmentServiceUnavailable({
                            details: "Enrichment service is currently unavailable."
                        })
                    }

                    return quoteFromRandom(item, random)
                })
            },
            categories: (items) => {
                return Effect.sync(function() {
                    return pipe(
                        items,
                        Array.map(item => item.category),
                        Array.dedupe,
                        Array.map((item) => new CatalogCategory({
                            name: item
                        }))
                    )
                })
            }
        })
    }
) {

    static readonly layerNoDeps = Layer.effect(this, this.make)

    static readonly layer = this.layerNoDeps

}
