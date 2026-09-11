import Link from "next/link";
import { NOT_FOUND_LINKS } from "@/data/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold">Page not found</h1>
      <p className="mt-4 text-text-secondary">This page does not exist. Start from one of our South Korea guides.</p>
      <p className="mt-6 flex flex-wrap justify-center gap-4">
        {NOT_FOUND_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-primary underline">{l.label}</Link>
        ))}
      </p>
    </div>
  );
}
