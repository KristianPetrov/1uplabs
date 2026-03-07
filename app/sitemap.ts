import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/app/lib/site";
import { products } from "@/app/lib/products";

export default function sitemap (): MetadataRoute.Sitemap
{
    const siteUrl = getSiteUrl();
    const now = new Date();

    return [
        {
            url: `${siteUrl}/`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${siteUrl}/store`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        ...products.map((product) => ({
            url: `${siteUrl}/products/${product.slug}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}


