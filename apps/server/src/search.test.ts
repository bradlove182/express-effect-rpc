import { describe, expect, test } from "bun:test"
import { CatalogItem, CatalogQuery, CatalogSearchResult } from "catalog-core"
import { Clock, Effect, Random } from "effect"
import { CatalogService } from "./services.ts"

const instantClock: Clock.Clock = {
    currentTimeMillisUnsafe: () => 0,
    currentTimeMillis: Effect.succeed(0),
    monotonicTimeNanosUnsafe: () => 0n,
    monotonicTimeNanos: Effect.succeed(0n),
    currentTimeNanosUnsafe: () => 0n,
    currentTimeNanos: Effect.succeed(0n),
    sleep: () => Effect.void,
}

const fixture = [
    new CatalogItem({ id: 1, name: "Sourdough Loaf", price: 7, category: "bakery", imageUrl: "a" }),
    new CatalogItem({ id: 2, name: "Croissant", price: 4, category: "bakery", imageUrl: "b" }),
    new CatalogItem({ id: 3, name: "Tuna Steak", price: 16, category: "seafood", imageUrl: "c" }),
    new CatalogItem({ id: 4, name: "Ribeye Steak", price: 28, category: "meat", imageUrl: "d" }),
    new CatalogItem({ id: 5, name: "Bagel", price: 3, category: "bakery", imageUrl: "e" }),
    new CatalogItem({ id: 6, name: "Bagel Chips", price: 9, category: "snacks", imageUrl: "f" }),
    new CatalogItem({ id: 7, name: "Ahi Tuna", price: 18, category: "seafood", imageUrl: "g" }),
]

const names = (results: ReadonlyArray<CatalogSearchResult>) => results.map((result) => result.item.name)

const fixedRandom = (value: number): Random.Random => ({
    nextIntUnsafe: () => 0,
    nextDoubleUnsafe: () => value,
})

const search = (
    query: {
        query?: string
        filter?: string
        sort?: "price" | "default"
    },
    random?: number,
) => {
    const program = Effect.gen(function* () {
        const catalog = yield* CatalogService
        return yield* catalog.search(fixture, new CatalogQuery(query))
    }).pipe(
        Effect.provide(CatalogService.layer),
        Effect.provideService(Clock.Clock, instantClock),
    )

    return Effect.runPromise(
        random === undefined
            ? program
            : program.pipe(Effect.provideService(Random.Random, fixedRandom(random))),
    )
}

describe("catalog search", () => {
    test("returns the catalog unchanged when query and filter are empty", async () => {
        expect(names(await search({}))).toEqual(fixture.map((item) => item.name))
    })

    test("filters by category when there is no text query", async () => {
        expect(names(await search({ filter: "bakery" }))).toEqual([
            "Sourdough Loaf",
            "Croissant",
            "Bagel",
        ])
    })

    test("matches every token against name or category", async () => {
        expect(names(await search({ query: "tuna steak" }))).toEqual(["Tuna Steak"])
        expect(names(await search({ query: "tuna xyz" }))).toEqual([])
        expect(names(await search({ query: "seafood" }))).toEqual(["Ahi Tuna", "Tuna Steak"])
    })

    test("ranks exact matches ahead of prefix, then contains, then by name", async () => {
        expect(names(await search({ query: "bagel", sort: "default" }))).toEqual([
            "Bagel",
            "Bagel Chips",
        ])
        expect(names(await search({ query: "tuna", sort: "default" }))).toEqual([
            "Tuna Steak",
            "Ahi Tuna",
        ])
        expect(names(await search({ query: "steak", sort: "default" }))).toEqual([
            "Ribeye Steak",
            "Tuna Steak",
        ])
    })

    test("sorts by price after filter and text ranking", async () => {
        expect(names(await search({ filter: "bakery", sort: "price" }))).toEqual([
            "Bagel",
            "Croissant",
            "Sourdough Loaf",
        ])
        expect(names(await search({ query: "steak", sort: "price" }))).toEqual([
            "Tuna Steak",
            "Ribeye Steak",
        ])
        expect(names(await search({ query: "steak", filter: "seafood", sort: "price" }))).toEqual([
            "Tuna Steak",
        ])
    })

    test("adds live price, stock, and delivery when enrichment succeeds", async () => {
        const [result] = await search({}, 0.1)

        expect(result?.item.discountedPrice).toBeCloseTo(0.7)
        expect(result?.item.inStock).toBe(false)
        expect(result?.item.deliveryEstimate).toBe("23–38 min")
        expect(result?.enrichmentError).toBeUndefined()
    })

    test("reports a missing enrich id before the upstream coin flip", async () => {
        const error = await Effect.runPromise(
            Effect.gen(function* () {
                const catalog = yield* CatalogService
                return yield* catalog.enrichById(fixture, 999)
            }).pipe(
                Effect.provide(CatalogService.layer),
                Effect.provideService(Clock.Clock, instantClock),
                Effect.provideService(Random.Random, fixedRandom(0.95)),
                Effect.flip,
            ),
        )

        expect(error._tag).toBe("packages/core/schema/CatalogItemNotFound")
    })

    test("keeps the catalog item and reports an error when enrichment fails", async () => {
        const [result] = await search({}, 0.95)

        expect(result?.item.name).toBe("Sourdough Loaf")
        expect(result?.item.price).toBe(7)
        expect(result?.item.discountedPrice).toBeUndefined()
        expect(result?.item.inStock).toBeUndefined()
        expect(result?.item.deliveryEstimate).toBeUndefined()
        expect(result?.enrichmentError).toBe("Live price and availability are unavailable.")
    })
})
