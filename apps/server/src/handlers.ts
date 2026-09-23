import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Catalog, CatalogApi, CatalogItem, CatalogItemNotFound, HealthResponse } from "catalog-core"
import { items } from "./data"

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
            .handle("enrichList", () => Effect.succeed(
                new Catalog({
                    items: items.map(item => (
                        new CatalogItem({
                            // oxlint-disable-next-line typescript/no-misused-spread -- Fine here because we are creating a new instance
                            ...item,
                            price: item.price * 2
                        })
                    ))
                })))
            .handle("enrichById", ({ params }) => {
                return Effect.gen(function*() {
                    const item = items.find((item) => item.id === params.id)

                    if (!item) {
                        return yield* new CatalogItemNotFound({ details: `Catalog item with ${params.id} not found.` })
                    }

                    return yield* Effect.succeed(
                        Object.assign(
                            item,
                            { price: item.price * 1.1 }
                        )
                    )
                })
            })
    }
)
