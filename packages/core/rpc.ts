import { Rpc, RpcGroup } from "effect/unstable/rpc"
import { Catalog, CatalogItem, CatalogItemNotFound, HealthResponse } from "./schema";
import { Schema } from "effect";

export const CatalogRpc = RpcGroup.make(
    Rpc.make("health", {
        success: HealthResponse
    }),
    Rpc.make("getCatalog", {
        success: Catalog
    }),
    Rpc.make("getCatalogItem", {
        payload: { id: Schema.Finite },
        success: CatalogItem,
        error: CatalogItemNotFound
    })
)
