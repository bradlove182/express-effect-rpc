import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Catalog, CatalogItem, CatalogItemNotFound, HealthResponse } from "./"
import { Schema } from "effect";

export class CatalogApiGroup extends HttpApiGroup.make("CatalogApiGroup", { topLevel: true })
  .add(
    HttpApiEndpoint.get("health", "/health", {
        success: HealthResponse
    }),
    HttpApiEndpoint.get("list", "/catalog", {
        success: Catalog
    }),
    HttpApiEndpoint.get("getById", "/catalog/:id", {
        payload: { id: Schema.Finite },
        success: CatalogItem,
        error: CatalogItemNotFound
    }),
      HttpApiEndpoint.get("enrichList", "/catalog/enrich", {
          success: Catalog
      }),
    HttpApiEndpoint.get("enrichById", "/catalog/:id/enrich", {
        payload: { id: Schema.Finite },
        success: CatalogItem,
        error: CatalogItemNotFound,
    }),
) { }

export class CatalogApi extends HttpApi.make("CatalogApi")
    .add(CatalogApiGroup)
    .annotateMerge(OpenApi.annotations({
        title: "Catalog API"
    }))
{ }
