import { Effect, Random } from "effect"

export const maybeSuccess = Effect.gen(function*() {
    const random = yield* Random.next
    if (random < 0.2) {
        return true
    } else {
        return false
    }
})

export function maybeSuccessWithDelay(delay?: number) {
    return Effect.gen(function*() {
        const random = yield* Random.next
        const currentDelay = delay ? delay * random : random * 1000
        yield* Effect.sleep(currentDelay)
        return yield* maybeSuccess
    })
}
