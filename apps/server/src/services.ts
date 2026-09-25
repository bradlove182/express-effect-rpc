import { CatalogItem, CatalogQuery, normalize } from "catalog-core";
import { Context, Effect, String, pipe, Array, Order, Layer } from "effect";

export class CatalogService extends Context.Service<
    CatalogService,
    {
        search: (items: CatalogItem[], query: CatalogQuery) => Effect.Effect<CatalogItem[]>
    }
>()(
    "apps/server/src/services/CatalogService",
    {
        make: Effect.succeed({
            search: (items: CatalogItem[], query: CatalogQuery) => {
                return Effect.gen(function*() {

                    if (!query.query) {
                        return yield* Effect.succeed(items)
                    }


                    const tokens = pipe(
                        query.query,
                        normalize,
                        String.split(/\s+/),
                        Array.filter(Boolean)
                    )

                    return pipe(
                        items,
                        Array.map(item => {
                            const fields = pipe(
                                [item.name, item.category],
                                Array.map(normalize)
                            )

                            let score = 0

                            for (const token of tokens) {
                                const hit = fields.some(field => field.includes(token))

                                if (!hit) {
                                    return undefined
                                }

                                for (const field of fields) {
                                    if (field === token) {
                                        score += 3
                                    } else if (field.startsWith(token)) {
                                        score += 2
                                    } else if (field.includes(token)) {
                                        score +=1
                                    }
                                }

                                return {item, score}
                            }
                        }),
                        Array.filter(Boolean),
                        Array.sortBy((a, b) => Order.Number(b!.score, a!.score) || Order.String(a!.item.name, b!.item.name)),
                        Array.map(item => item!.item)
                    )
                })
            }
        })
    }
) {

    static readonly layerNoDeps = Layer.effect(this, this.make)

    static readonly layer = this.layerNoDeps

}
