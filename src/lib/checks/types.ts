import { STATIC_PAGES } from "@/lib/content/pages";

export type CheckResult = { name: string; errors: string[]; warnings: string[] };

export const result = (name: string): CheckResult => ({ name, errors: [], warnings: [] });

export const staticLivePaths = () => new Set<string>(["/", "/feed.xml", ...STATIC_PAGES.map((s) => `/${s}`)]);

export const rel = (file: string) => file.replace(process.cwd(), "").replace(/\\/g, "/").replace(/^\//, "");
