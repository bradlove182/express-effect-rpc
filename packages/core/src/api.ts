import { HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { Catalog, CatalogItem, CatalogItemNotFound, HealthResponse, EnrichmentServiceUnavailable } from "./"
import { Schema } from "effect";
import { SERVER_PORT } from "./dev"
import { FetchHttpClient } from "effect/unstable/http";
import { Effect } from "effect"

export class CatalogApiGroup extends HttpApiGroup.make("packages/core/api/CatalogApiGroup", { topLevel: true })
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
          error: [EnrichmentServiceUnavailable, HttpApiError.InternalServerErrorNoContent]
      }),
    HttpApiEndpoint.get("enrichById", "/catalog/:id/enrich", {
        params: { id: Schema.Finite },
        success: CatalogItem,
        error: [CatalogItemNotFound, EnrichmentServiceUnavailable, HttpApiError.InternalServerErrorNoContent]
    }),
) { }

export class CatalogApi extends HttpApi.make("packages/core/api/CatalogApi")
    .add(CatalogApiGroup)
    .annotateMerge(OpenApi.annotations({
        title: "Catalog API"
    }))
{ }

export const apiClient = HttpApiClient.make(CatalogApi, {
    baseUrl: `http://localhost:${SERVER_PORT}`
}).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.scoped,
)
