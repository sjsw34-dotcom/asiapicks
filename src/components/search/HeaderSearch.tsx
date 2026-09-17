import Link from "next/link";

const Icon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** A plain GET form: works before any script loads, and /search takes it from there. */
export default function HeaderSearch() {
  return (
    <>
      <form action="/search" method="get" role="search" className="relative hidden lg:block">
        <label htmlFor="header-search" className="sr-only">Search guides</label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"><Icon /></span>
        <input
          id="header-search"
          type="search"
          name="q"
          placeholder="Search guides"
          autoComplete="off"
          enterKeyHint="search"
          className="h-10 w-52 rounded-full border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-white"
        />
      </form>
      <Link
        href="/search"
        aria-label="Search guides"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-primary hover:text-primary lg:hidden"
      >
        <Icon />
      </Link>
    </>
  );
}
