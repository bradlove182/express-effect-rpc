// oxlint-disable-next-line effecttsgo/node-builtin-import -- Required for express
import { createServer, type Server } from "node:http"

import { NodeRuntime, NodeSocketServer } from "@effect/platform-node"
import { CatalogRpc } from "catalog-core"
import { SERVER_PORT } from "catalog-core/dev"
import { Effect, Layer } from "effect"
import { RpcSerialization, RpcServer } from "effect/unstable/rpc"
import express from "express"

import { CatalogHandlers } from "./handlers"

const RpcLive = (server: Server) =>
    RpcServer.layer(CatalogRpc).pipe(
        Layer.provide(CatalogHandlers),
        Layer.provide(RpcServer.layerProtocolSocketServer),
        Layer.provide(NodeSocketServer.layerWebSocket({ server, path: "/rpc" })),
        Layer.provide(RpcSerialization.layerNdjson),
    )

const main = Effect.gen(function* () {
    const app = express()
    const server = createServer(app)

    // `ws` forwards the http server's `listening` event, so the socket server
    // layer must attach before `listen` is called.
    yield* Effect.all(
        [
            Layer.launch(RpcLive(server)),
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
