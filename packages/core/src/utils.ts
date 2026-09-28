import { Effect, Random, pipe, String } from "effect"

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
