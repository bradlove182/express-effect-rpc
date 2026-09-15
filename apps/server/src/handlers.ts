import { Effect } from "effect"
import { CatalogRpc, Catalog, CatalogItem, CatalogItemNotFound, HealthResponse } from "catalog-core"

const items = [
    new CatalogItem({ id: 1, name: "Desk", price: 249, category: "furniture", imageUrl: "/desk.png" }),
    new CatalogItem({ id: 2, name: "Lamp", price: 39, category: "lighting", imageUrl: "/lamp.png" })
]

export const CatalogHandlers = CatalogRpc.toLayer({
    health: () => Effect.succeed(new HealthResponse({ success: "ok" })),
    getCatalog: () => Effect.succeed(new Catalog({ items })),
    getCatalogItem: ({ id }) =>
        Effect.gen(function*() {
            const item = items.find((candidate) => candidate.id === id)
            if (item === undefined) {
                return yield* new CatalogItemNotFound({ details: `Item with id ${id} not found` })
            }
            return item
        })
})
