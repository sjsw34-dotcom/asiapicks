import { generatePageMetadata } from "@/lib/seo";
import { getAllCities } from "@/lib/destinations";
import { getAllPosts } from "@/lib/blog";
import SearchClient from "@/components/search/SearchClient";

export const metadata = generatePageMetadata({
  title: "Search — Asiapicks Asia Travel",
  description:
    "Search destinations, city guides, hotel recommendations, and travel articles across Japan, Thailand, South Korea, and Vietnam.",
  path: "/search",
});

export const revalidate = 3600;

export default async function SearchPage() {
  const cities = getAllCities();
  const posts = await getAllPosts(100);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
          Search
        </h1>
        <p className="mt-2 text-text-secondary">
          Find destinations, guides, hotels, and travel tips across Asia.
        </p>
      </div>

      <SearchClient cities={cities} posts={posts} />
    </div>
  );
}
