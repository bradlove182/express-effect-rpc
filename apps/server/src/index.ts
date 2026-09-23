// oxlint-disable-next-line effecttsgo/node-builtin-import -- Required for express
import { createServer } from "node:http"
import { NodeRuntime } from "@effect/platform-node"
import { SERVER_PORT } from "../../../packages/core/src/dev"
import { Effect, Layer } from "effect"
import express from "express"
import { CatalogApiLayer } from "./handlers"
import { layer as HttpRouterLayer } from "effect/unstable/http/HttpRouter";

const mainLayer = HttpRouterLayer.pipe(
    Layer.provide(CatalogApiLayer),
)

const main = Effect.gen(function* () {
    const app = express()
    const server = createServer(app)

    yield* Effect.all(
        [
            Layer.launch(mainLayer),
            Effect.sync(() => server.listen(SERVER_PORT)),
            Effect.log(`Server listening on port ${SERVER_PORT}`),
        ],
        { concurrency: "unbounded", discard: true },
    )

    // Keep the main fiber running so `runMain` never closes the scope that the
    // launched RPC layer lives in. Without this, the effect returns
    // immediately, the scope closes, and every WebSocket connection is torn
    // down right after it opens.
    return yield* Effect.never
})

NodeRuntime.runMain(main)
