import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/privacy", "/terms", "/cookies", "/contact"].map((path) => ({ url: `https://skywork.seymata.com${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.6 })); }
