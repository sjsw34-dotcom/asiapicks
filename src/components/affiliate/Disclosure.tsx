import Link from "next/link";

export default function Disclosure() {
  return (
    <p className="my-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
      We may earn a commission if you book through links on this page, at no extra cost to you.{" "}
      <Link href="/affiliate-disclosure" className="underline underline-offset-2">How we make money</Link>
    </p>
  );
}
