import Link from "next/link";
import { getEditor } from "@/data/editors";
import { formatDate } from "@/lib/content/body";

export default function ArticleMeta({ updatedAt, factCheckedAt, author }: { updatedAt: string; factCheckedAt?: string; author: string }) {
  const editor = getEditor(author);
  return (
    <p className="mt-3 text-sm text-text-secondary">
      Updated <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
      {factCheckedAt ? <> · Fact-checked <time dateTime={factCheckedAt}>{formatDate(factCheckedAt)}</time></> : null}
      {" · "}By <Link href="/about" className="underline underline-offset-2">{editor.name}</Link>
    </p>
  );
}
