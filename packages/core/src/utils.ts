import { Effect, Random, pipe, String } from "effect"

export const maybeSuccess = Effect.gen(function*() {
    const random = yield* Random.next
    if (random < 0.2) {
        return true
    } else {
        return false
    }
})

/**
 * Use this function to simulate an upstream providers potential delay or availability
 */
export function maybeSuccessWithDelay(delay?: number) {
    return Effect.gen(function*() {
        const random = yield* Random.next
        const currentDelay = delay ? delay * random : random * 1000
        yield* Effect.sleep(currentDelay)
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
