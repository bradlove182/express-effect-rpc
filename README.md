# Catalog search

Local catalog search with live price, stock, and delivery estimates.

## Run

```bash
bun install
bun run dev
```

The API listens on port 3000. The client listens on port 3001.

```bash
bun run test
bun run build
bun run start
```

`test` runs the server search tests. `build` builds the client. `start` runs the API and the built client. Run `build` first.

Interactive API docs are at [http://localhost:3000/docs](http://localhost:3000/docs). The OpenAPI document is at [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json).

## API

### `GET /health`

```bash
curl http://localhost:3000/health
```

```json
{ "_tag": "packages/core/schema/HealthResponse", "success": "ok" }
```

### `GET /catalog`

Free-text search across item name and category, with an optional category filter and price sort. Every result is a `CatalogSearchResult`. When the upstream quote fails, `enrichmentError` is set and `item` stays the catalog record, without live stock, discount, or delivery.

Query parameters:

- `_tag` — required, `packages/core/schema/CatalogQuery`.
- `query` — optional text. Every word must match the name or category.
- `filter` — optional category, for example `bakery`.
- `sort` — `price` or `default`. `price` is lowest catalog price first. `default` is relevance, then name.

`discountedPrice`, `inStock`, and `deliveryEstimate` change between requests.

```bash
curl --get "http://localhost:3000/catalog" \
  --data-urlencode "_tag=packages/core/schema/CatalogQuery" \
  --data-urlencode "query=steak" \
  --data-urlencode "filter=seafood" \
  --data-urlencode "sort=price"
```

```json
[
  {
    "_tag": "packages/core/schema/CatalogSearchResult",
    "item": {
      "_tag": "packages/core/schema/CatalogItem",
      "id": 18,
      "name": "Tuna Steak",
      "price": 16,
      "category": "seafood",
      "imageUrl": "https://picsum.photos/seed/tuna/400/300",
      "inStock": true,
      "discountedPrice": 13.39,
      "deliveryEstimate": "41–56 min"
    }
  }
]
```

A failed quote looks like this:

```json
{
  "_tag": "packages/core/schema/CatalogSearchResult",
  "item": {
    "_tag": "packages/core/schema/CatalogItem",
    "id": 18,
    "name": "Tuna Steak",
    "price": 16,
    "category": "seafood",
    "imageUrl": "https://picsum.photos/seed/tuna/400/300"
  },
  "enrichmentError": "Live price and availability are unavailable."
}
```

### `GET /catalog/:id`

```bash
curl http://localhost:3000/catalog/18
```

Returns the catalog record without a live quote. Unknown ids respond with `404` and a `CatalogItemNotFound` body.

### `GET /catalog/:id/enrich`

```bash
curl http://localhost:3000/catalog/18/enrich
```

Returns one live quote, including `discountedPrice`, `inStock`, and `deliveryEstimate`. An unknown id responds with `404` and `CatalogItemNotFound`. Upstream failure responds with `503` and `EnrichmentServiceUnavailable`.

### `GET /catalog/categories`

```bash
curl http://localhost:3000/catalog/categories
```

```json
[
  { "_tag": "packages/core/schema/CatalogCategory", "name": "bakery" }
]
```
