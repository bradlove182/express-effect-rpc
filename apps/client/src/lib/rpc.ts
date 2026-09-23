import { SERVER_PORT } from "../../../../packages/core/src/dev"
import { Effect, Layer, type Scope } from "effect"
import { RpcClient, RpcSerialization } from "effect/unstable/rpc"
import { HttpClient, layerMergedContext } from "effect/unstable/http/HttpClient";

// A single-connection protocol. Composed once, provided per program.
const ProtocolLayer = RpcClient.layerProtocolHttp({ url: `http://localhost:${SERVER_PORT}/rpc` }).pipe(
    Layer.provide(layerMergedContext(HttpClient)),
    Layer.provide(RpcSerialization.layerNdjson),
)

// Runs a program against the RPC server. The WebSocket connection (and the
// client built from it) lives in the same scope that `Effect.scoped` opens and
// closes, so it stays alive for the full program and is torn down afterwards.
// Do NOT extract a client out of this scope and reuse it -- that interrupts
// the connection fibers and fails with "All fibers interrupted without error".
export const runRpc = <A, E>(program: Effect.Effect<A, E, RpcClient.Protocol | Scope.Scope>) =>
    Effect.runPromise(program.pipe(Effect.scoped, Effect.provide(ProtocolLayer)))
