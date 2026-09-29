import { Effect, Random, pipe, String, Duration, FiberHandle, Queue, Stream } from "effect"

export const maybeSuccess = Effect.gen(function*() {
    const random = yield* Random.next
    if (random < 0.8) {
        return true
    } else {
        return false
    }
})

export function delay(time?: number) {
    return Effect.gen(function*() {
        const random = yield* Random.next
        const currentDelay = time ? time * random : random * 1000
        yield* Effect.sleep(currentDelay)
    })
}

/**
 * Use this function to simulate an upstream providers potential delay or availability
 */
export function maybeSuccessWithDelay(time?: number) {
    return Effect.gen(function*() {
        yield* delay(time)
        return yield* maybeSuccess
    })
}

export function normalize(str: string) {
    return pipe(
        str,
        String.trim,
        String.toLowerCase
    )
}

export const debounce = <A, E, R>(
  f: (a: A) => Effect.Effect<void, E, R>,
  delay: Duration.Input
) =>
  Effect.gen(function* () {
    const queue = yield* Queue.make<A>()
    yield* Stream.fromQueue(queue).pipe(
      Stream.debounce(delay),
      Stream.runForEach(f),
      Effect.forkChild
    )
    return (a: A) => Queue.offer(queue, a).pipe(Effect.asVoid)
  })
