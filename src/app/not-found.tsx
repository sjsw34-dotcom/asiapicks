import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold">Page not found</h1>
      <p className="mt-4 text-text-secondary">This page does not exist. Start from one of our South Korea guides.</p>
      <p className="mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/korea" className="text-primary underline">South Korea</Link>
        <Link href="/korea/seoul" className="text-primary underline">Seoul</Link>
        <Link href="/korea/busan" className="text-primary underline">Busan</Link>
        <Link href="/korea/jeju" className="text-primary underline">Jeju</Link>
      </p>
    </div>
  );
}
