# Solution

## Layout

Bun workspace with three packages:

- `packages/core` is the shared contract: Effect Schema models and the HTTP API description.
- `apps/server` loads an in-memory catalog of about 40 items and implements that API.
- `apps/client` is a SvelteKit app that talks to the server through the same contract.

The client never defines its own response types. `HttpApiClient` is generated from `CatalogApi`, and the server implements that same group.

## Search

`CatalogService.search` does three steps:

1. Keep items whose category equals `query.filter`. An empty filter keeps the whole catalog, including when there is no text query.
2. If `query.query` is set, split it on whitespace and require every token to appear in the item name or category. Scoring is exact match 3, prefix 2, contains 1. Ties break by name.
3. `sort: "price"` orders the result by price ascending. `default` or an omitted sort leaves the relevance order, or the original catalog order when there was no text query.

Text matching is normalized with trim and lower case. The catalog is `apps/server/src/catalog.json`, decoded at startup. There is no database.

## Enrichment

`search` quotes every result before it returns. Each quote sleeps a random fraction of 500ms, fails about one time in five, and on success adds `discountedPrice`, `inStock`, and `deliveryEstimate`. Quotes run concurrently, so one slow item does not wait behind the others.

A failed quote does not fail the search. The list returns a `CatalogSearchResult`: the catalog `item` plus `enrichmentError`. The error is not a field on `CatalogItem`. The card shows the catalog price and that message, and does not render a stock badge. `GET /catalog/:id/enrich` looks up the item first, then quotes it. A missing id is `404`. An upstream failure is `503`.

## Client

The page has a debounced text field, a category select, and a price/relevance sort select. Controls stack on a narrow screen and sit in a row from the `md` breakpoint. Results are one column on a phone, two from `sm`, and four from `xl`. Query state is written into the URL. The list shows skeletons while search and quoting are in flight, an empty state when nothing matches, and an error when the request fails. A card whose search result has `enrichmentError` shows that message and does not render a stock badge.

## Trade-offs

- The HTTP server is Effect's Node HTTP server plus `HttpApiBuilder`. The client and server share one contract.
- Quoting happens inside search, concurrently. The list waits for the slowest quote, and the skeleton stays up while that happens. A failed quote stays on the card instead of removing the item or failing the page.
- The server is executed as TypeScript with `tsx`. `bun run build` only builds the client.

## Tests and scripts

`apps/server/src/search.test.ts` drives `CatalogService.search` with a small fixture. Cases cover an empty query, category filter with no text, multi-token matching, relevance order (exact, then prefix, then contains, then name), price sort combined with a filter, a successful quote, and a failed quote. The test replaces `Clock` with one whose `sleep` does nothing, and the quote cases replace `Random` with a fixed value.

From the repo root:

- `bun run dev` starts the API (port 3000) and the client (port 3001)
- `bun run test` runs the search tests
- `bun run build` builds the client
- `bun run start` starts the API and the built client. Run `build` first.

## AI assistance

AI was used to review the code and make sure we are meeting the requirements outlined in the assessment and to generate any documentation including this file.
