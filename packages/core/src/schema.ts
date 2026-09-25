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
        query: Schema.optionalKey(Schema.String),
        offset: Schema.optionalKey(Schema.Finite),
        sort: Schema.optionalKey(Schema.String),
        filter: Schema.optionalKey(Schema.String)
    }
) {}

export class CatalogItemNotFound extends Schema.TaggedError<CatalogItemNotFound>()(
    "packages/core/schema/CatalogItemNotFound",
    {
        details: Schema.String,
    }
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
    }
) { }

export class EnrichmentServiceUnavailable extends Schema.TaggedError<EnrichmentServiceUnavailable>()(
    "packages/core/schema/EnrichmentServiceUnavailable",
    {
        details: Schema.String
    }
) {}
