import { Layer } from "effect"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { CatalogApi } from "catalog-core"
import { CatalogApiLayer } from "./handlers.ts";

export const apiRoutes = HttpApiBuilder.layer(CatalogApi, {
  openapiPath: "/openapi.json"
}).pipe(
  Layer.provide(CatalogApiLayer)
)

export const docsRoutes = HttpApiScalar.layer(CatalogApi, {
  path: "/docs"
})

export const allRoutes = Layer.mergeAll(apiRoutes, docsRoutes)
