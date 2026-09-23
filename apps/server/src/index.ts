import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
// oxlint-disable-next-line effecttsgo/node-builtin-import
import { createServer } from "node:http"
import { Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { allRoutes } from "./routes.ts"
import { SERVER_PORT } from "catalog-core/dev"

const routesLayer = allRoutes

const serverLayer = NodeHttpServer.layer(createServer, { port: SERVER_PORT })

const httpLayer = HttpRouter.serve(routesLayer).pipe(
  Layer.provide(serverLayer)
)

NodeRuntime.runMain(Layer.launch(httpLayer))
