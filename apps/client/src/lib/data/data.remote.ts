import { query } from "$app/server"
import { error } from "@sveltejs/kit";
import { useApiClient } from "../hooks/hooks.svelte";
import { Effect, Result, Schema } from "effect"
import { CatalogQuery, CatalogItem, CatalogCategory } from "catalog-core";

export const list = query(
    Schema.toStandardSchemaV1(CatalogQuery),
    // oxlint-disable-next-line effecttsgo/async-function
    async (query) => {

        const { client } = useApiClient()

        const result = await client.list({ query }).pipe(Effect.runPromise)

        // oxlint-disable-next-line effecttsgo/schema-sync
        return Schema.encodeSync(Schema.Array(CatalogItem))(result)
    }
)

export const enrich = query.batch(
    Schema.toStandardSchemaV1(Schema.Finite),
    // oxlint-disable-next-line effecttsgo/async-function
    async (ids) => {

        const { client } = useApiClient()

        const results = await Effect.forEach(
            ids,
            (id) => client.enrichById({ params: { id } }).pipe(Effect.result),
            { concurrency: "unbounded" },
        ).pipe(Effect.runPromise)

        return (_id, index) => {
            const result = results[index]
            if (Result.isFailure(result)) {
                return error(500, result.failure.message)
            }

            // oxlint-disable-next-line effecttsgo/schema-sync
            return Schema.encodeSync(CatalogItem)(result.success)
        }

    }
)

export const categories = query(
    "unchecked",
    // oxlint-disable-next-line effecttsgo/async-function
    async () => {

        const { client } = useApiClient()

        const results = await client.categories().pipe(Effect.runPromise)

        // oxlint-disable-next-line effecttsgo/schema-sync
        return Schema.encodeSync(Schema.Array(CatalogCategory))(results)

    }
)
