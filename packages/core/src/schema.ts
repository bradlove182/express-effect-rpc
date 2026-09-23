import { Schema } from "effect"

export class HealthResponse extends Schema.TaggedClass<HealthResponse>()(
    "packages/core/schema/HealthResponse",
    {
        success: Schema.Literal("ok")
    }
) { }

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
        inStock: Schema.optional(Schema.Boolean),
        discountedPrice: Schema.optional(Schema.Finite),
    }
) { }

export class Catalog extends Schema.TaggedClass<Catalog>()(
    "packages/core/schema/Catalog",
    {
        items: Schema.Array(CatalogItem)
    }
) { }

export class EnrichmentServiceUnavailable extends Schema.TaggedError<EnrichmentServiceUnavailable>()(
    "packages/core/schema/EnrichmentServiceUnavailable",
    {
        details: Schema.String
    }
) {}
