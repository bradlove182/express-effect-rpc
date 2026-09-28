import { CatalogItem, CatalogItemNotFound, CatalogQuery, EnrichmentServiceUnavailable, maybeSuccessWithDelay, normalize } from "catalog-core";
import { Context, Effect, String, pipe, Array, Order, Layer, Random } from "effect";

export class CatalogService extends Context.Service<
    CatalogService,
    {
        getById: (items: CatalogItem[], id: CatalogItem["id"]) => Effect.Effect<CatalogItem, CatalogItemNotFound>,
        search: (items: CatalogItem[], query: CatalogQuery) => Effect.Effect<CatalogItem[]>,
        enrichById: (items: CatalogItem[], id: CatalogItem["id"]) => Effect.Effect<CatalogItem, EnrichmentServiceUnavailable | CatalogItemNotFound>,
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

                    if (!query.query) {
                        return yield* Effect.succeed(items)
                    }


                    const tokens = pipe(
                        query.query,
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

                                return {item, score}
                            }
                        }),
                        Array.filter(Boolean),
                        // It is ok to assert the the existence here because we filtered out any undefined values
                        Array.sortBy((a, b) => Order.Number(b!.score, a!.score) || Order.String(a!.item.name, b!.item.name)),
                        Array.map(item => item!.item)
                    )
                })
            },
            enrichById: (items, id) => {
                return Effect.gen(function*() {
                    const random = yield* Random.next
                    const success = yield* maybeSuccessWithDelay(500)

                    if (!success) {
                        return yield* new EnrichmentServiceUnavailable({
                            details: "Enrichment service is currently unavailable."
                        })
                    }

                    const item = items.find(curr => curr.id === id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${id} not found.` })
                    }

                    return new CatalogItem({
                        // oxlint-disable-next-line typescript/no-misused-spread -- We reconstructing the prototype
                        ...item,
                        discountedPrice: item.price * random,
                        inStock: random > 0.5
                    })
                })
            }
        })
    }
) {

    static readonly layerNoDeps = Layer.effect(this, this.make)

    static readonly layer = this.layerNoDeps

}
