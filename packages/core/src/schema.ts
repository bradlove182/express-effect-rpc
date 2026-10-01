import { Schema } from "effect"

export class HealthResponse extends Schema.TaggedClass<HealthResponse>()(
    "packages/core/schema/HealthResponse",
    {
        success: Schema.Literal("ok")
    }
) { }

export class CatalogQuery extends Schema.TaggedClass<CatalogQuery>()(
    "packages/core/schema/CatalogQuery",
    {
        query: Schema.optional(Schema.String),
        sort: Schema.optional(Schema.String),
        filter: Schema.optional(Schema.String)
    }
) {}

export class CatalogItemNotFound extends Schema.TaggedError<CatalogItemNotFound>()(
    "packages/core/schema/CatalogItemNotFound",
    {
        details: Schema.String,
    },
    { httpApiStatus: 404 }
) {}

export class CatalogItem extends Schema.TaggedClass<CatalogItem>()(
    "packages/core/schema/CatalogItem",
    {
        id: Schema.Finite,
        name: Schema.String,
        price: Schema.Finite,
        category: Schema.String,
        imageUrl: Schema.String,
        inStock: Schema.optionalKey(Schema.Boolean),
        discountedPrice: Schema.optionalKey(Schema.Finite),
        deliveryEstimate: Schema.optionalKey(Schema.String),
    }
) { }

export class CatalogSearchResult extends Schema.TaggedClass<CatalogSearchResult>()(
    "packages/core/schema/CatalogSearchResult",
    {
        item: CatalogItem,
        enrichmentError: Schema.optionalKey(Schema.String),
    }
) { }

export class CatalogCategory extends Schema.TaggedClass<CatalogCategory>()(
    "packages/core/schema/CatalogCategory",
    {
        name: Schema.String
    }
) { }

export class EnrichmentServiceUnavailable extends Schema.TaggedError<EnrichmentServiceUnavailable>()(
    "packages/core/schema/EnrichmentServiceUnavailable",
    {
        details: Schema.String
    },
    { httpApiStatus: 503 }
) {}
