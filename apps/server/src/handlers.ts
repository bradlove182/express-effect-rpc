import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import {
    CatalogApi,
    CatalogQuery,
    HealthResponse,
} from "catalog-core"
import { items } from "./data"
import { CatalogService } from "./services";

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
                        ...query
                    })

                    return yield* catalog.search(items, currentQuery)
                })

            })
            .handle("getById", ({ params }) => {
                return Effect.gen(function*() {
                    const catalog = yield* CatalogService

                    return yield* catalog.getById(items, params.id)
                })
            })
            .handle("enrichById", ({ params }) => {
                return Effect.gen(function*() {
                    const catalog = yield* CatalogService

                    return yield* catalog.enrichById(items, params.id)
                })
            })
            .handle("categories", () => {
                return Effect.gen(function*() {
                    const catalog = yield* CatalogService

                    return yield* catalog.categories(items)
                })
            })
    }
)
