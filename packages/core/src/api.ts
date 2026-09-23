import { HttpApi, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Catalog, CatalogItem, CatalogItemNotFound, HealthResponse } from "./"
import { Schema } from "effect";

export class CatalogApiGroup extends HttpApiGroup.make("CatalogApiGroup", { topLevel: true })
  .add(
    HttpApiEndpoint.get("health", "/health", {
        success: HealthResponse
    }),
    HttpApiEndpoint.get("list", "/catalog", {
        success: Catalog,
        error: HttpApiError.InternalServerErrorNoContent
    }),
    HttpApiEndpoint.get("getById", "/catalog/:id", {
        params: { id: Schema.Finite },
        success: CatalogItem,
        error: [CatalogItemNotFound, HttpApiError.InternalServerErrorNoContent]
    }),
      HttpApiEndpoint.get("enrichList", "/catalog/enrich", {
          success: Catalog,
          error: HttpApiError.InternalServerErrorNoContent
      }),
    HttpApiEndpoint.get("enrichById", "/catalog/:id/enrich", {
        params: { id: Schema.Finite },
        success: CatalogItem,
        error: [CatalogItemNotFound, HttpApiError.InternalServerErrorNoContent]
    }),
) { }

export class CatalogApi extends HttpApi.make("CatalogApi")
    .add(CatalogApiGroup)
    .annotateMerge(OpenApi.annotations({
        title: "Catalog API"
    }))
{ }
