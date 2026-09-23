import { Effect, Random } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Catalog, CatalogApi, CatalogItem, CatalogItemNotFound, EnrichmentServiceUnavailable, HealthResponse, maybeSuccessWithDelay } from "catalog-core"
import { items } from "./data"

function enrichCatalogItem(item: CatalogItem) {
    return Effect.gen(function*() {
        const random = yield* Random.next
        return yield* Effect.succeed(
            Object.assign(
                item,
                {
                    discountedPrice: item.price * random,
                    inStock: random > 0.5
                }
            )
        )
    })
}

export const CatalogApiLayer = HttpApiBuilder.group(
    CatalogApi,
    "CatalogApiGroup",
    (handlers) => {
        return handlers
            .handle("health", () => Effect.succeed(new HealthResponse({ success: "ok" })))
            .handle("list", () => Effect.succeed(new Catalog({ items })))
            .handle("getById", ({ params }) => {
                return Effect.gen(function*() {
                    const item = items.find((item) => item.id === params.id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${params.id} not found.` })
                    }

                    return yield* Effect.succeed(item)
                })

            })
            .handle("enrichList", () => {
                return Effect.gen(function*() {
                    const success = yield* maybeSuccessWithDelay(1000)

                    if (!success) {
                        return yield* new EnrichmentServiceUnavailable({
                            details: "Enrichment service is currently unavailable."
                        })

                    }

                    const enrichedItems = yield* Effect.forEach(items, enrichCatalogItem)

                    return yield* Effect.succeed(new Catalog({ items: enrichedItems }))
                })
            })
            .handle("enrichById", ({ params }) => {
                return Effect.gen(function*() {
                    const success = yield* maybeSuccessWithDelay(1000)

                    if (!success) {
                        return yield* new EnrichmentServiceUnavailable({
                            details: "Enrichment service is currently unavailable."
                        })

                    }

                    const item = items.find((item) => item.id === params.id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${params.id} not found.` })
                    }

                    const enrichedItem = yield* enrichCatalogItem(item)

                    return yield* Effect.succeed(enrichedItem)
                })
            })
    }
)
