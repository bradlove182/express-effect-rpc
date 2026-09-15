import { NodeRuntime, NodeSocketServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { RpcSerialization, RpcServer } from "effect/unstable/rpc"
import express from "express"
// oxlint-disable-next-line effecttsgo/node-builtin-import -- Required for express
import { createServer, type Server } from "node:http"
import { CatalogHandlers } from "./handlers"
import { CatalogRpc, SERVER_PORT } from "catalog-core"

const RpcLive = (server: Server) =>
    RpcServer.layer(CatalogRpc).pipe(
        Layer.provide(CatalogHandlers),
        Layer.provide(RpcServer.layerProtocolSocketServer),
        Layer.provide(NodeSocketServer.layerWebSocket({ server, path: "/rpc" })),
        Layer.provide(RpcSerialization.layerNdjson)
    )

const main = Effect.gen(function*() {
    const app = express()
    const server = createServer(app)

    // `ws` forwards the http server's `listening` event, so the socket server
    // layer must attach before `listen` is called.
    yield* Effect.all(
        [
            Layer.launch(RpcLive(server)),
            Effect.sync(() => server.listen(SERVER_PORT)),
            Effect.log(`Server listening on port ${SERVER_PORT}`)
        ],
        { concurrency: "unbounded", discard: true }
    )

})

NodeRuntime.runMain(main)
