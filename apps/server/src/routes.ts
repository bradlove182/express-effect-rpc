import { Layer } from "effect"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { CatalogApi } from "catalog-core"
import { CatalogApiLayer } from "./handlers.ts";
import { HttpRouter } from "effect/unstable/http";
import { CatalogService } from "./services.ts";

export const apiRoutes = HttpApiBuilder.layer(CatalogApi, {
  openapiPath: "/openapi.json"
}).pipe(
    Layer.provide(CatalogApiLayer),
    Layer.provide(HttpRouter.cors({
      allowedOrigins: ["*"],
      credentials: true,
    })),
    Layer.provide(CatalogService.layer),
)

export const docsRoutes = HttpApiScalar.layer(CatalogApi, {
  path: "/docs"
})

export const allRoutes = Layer.mergeAll(apiRoutes, docsRoutes)
