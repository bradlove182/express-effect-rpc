import { Effect, Random } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import {
    CatalogApi,
    CatalogItem,
    CatalogItemNotFound,
    CatalogQuery,
    EnrichmentServiceUnavailable,
    HealthResponse,
    maybeSuccessWithDelay,
} from "catalog-core"
import { items } from "./data"
import { CatalogService } from "./services";

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
    "packages/core/api/CatalogApiGroup",
    (handlers) => {
        return handlers
            .handle("health", () => Effect.succeed(new HealthResponse({ success: "ok" })))
            .handle("list", ({ query }) => {
                return Effect.gen(function*() {
                    const catalog = yield* CatalogService

                    const currentQuery = new CatalogQuery({
                        offset: 0,
                        sort: "price",
                        ...query
                    })

                    return yield* catalog.search(items, currentQuery)
                })

            })
            .handle("getById", ({ params }) => {
                return Effect.gen(function*() {
                    const item = items.find((item) => item.id === params.id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${params.id} not found.` })
                    }

                    return item
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

                    return yield* Effect.forEach(items, enrichCatalogItem)
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

                    return enrichedItem
                })
            })
    }
)
