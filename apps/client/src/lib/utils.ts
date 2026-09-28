import type { CatalogItem } from "catalog-core";

export { cn } from "cn";

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function calculateDiscount(item: CatalogItem): number {
    if (item.discountedPrice == null || item.price <= 0) {
        return 0
    }

    return ((item.price - item.discountedPrice) / item.price)
}
