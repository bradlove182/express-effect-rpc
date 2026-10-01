import { CatalogItem } from "catalog-core"
import { Schema } from "effect"
import catalogJson from "./catalog.json" with { type: "json" }

// oxlint-disable-next-line effecttsgo/schema-sync
export const items = Schema.decodeSync(Schema.Array(CatalogItem))(
    catalogJson.map((item) => new CatalogItem(item)),
).slice()
