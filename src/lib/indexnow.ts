import fs from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/site";

export function indexNowPayload(urls: string[], key: string) {
  const host = new URL(SITE.baseUrl).host;
  return { host, key, keyLocation: `${SITE.baseUrl}/${key}.txt`, urlList: urls };
}

export function findIndexNowKey(publicDir = path.join(process.cwd(), "public"), env: NodeJS.ProcessEnv = process.env): string {
  if (env.INDEXNOW_KEY?.trim()) return env.INDEXNOW_KEY.trim();
  const file = fs.readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!file) throw new Error("No IndexNow key: set INDEXNOW_KEY or add public/<key>.txt");
  return file.replace(/\.txt$/, "");
}
