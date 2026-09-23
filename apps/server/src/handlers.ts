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
            .handle("getById", ({ payload }) => {
                const item = items.find((item) => item.id === payload.id)

                if (!item) {
                    return new CatalogItemNotFound({ details: `Catalog item with ${payload.id} not found.` })
                }

                return Effect.succeed(item)
            })
            .handle("enrichList", () => Effect.succeed(
                new Catalog({
                    items: items.map(item => (
                        new CatalogItem({
                            // oxlint-disable-next-line typescript/no-misused-spread -- Fine here because we are creating a new instance
                            ...item,
                            price: item.price * 1.1
                        })
                    ))
                })))
            .handle("enrichById", ({ payload }) => {
                const item = items.find((item) => item.id === payload.id)

                if (!item) {
                    return new CatalogItemNotFound({ details: `Catalog item with ${payload.id} not found.` })
                }

                return Effect.succeed(
                    Object.assign(
                        item,
                        { price: item.price * 1.1 }
                    )
                )
            })
  }
)
