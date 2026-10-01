import { query } from "$app/server"
import { useApiClient } from "../hooks/hooks.svelte";
import { Effect, Schema } from "effect"
import { CatalogQuery, CatalogSearchResult, CatalogCategory } from "catalog-core";

export const list = query(
    Schema.toStandardSchemaV1(CatalogQuery),
    // oxlint-disable-next-line effecttsgo/async-function
    async (query) => {

        const { client } = useApiClient()

        const result = await client.list({ query }).pipe(Effect.runPromise)

        // oxlint-disable-next-line effecttsgo/schema-sync
        return Schema.encodeSync(Schema.Array(CatalogSearchResult))(result)
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
