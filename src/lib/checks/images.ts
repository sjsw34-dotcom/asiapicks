import fs from "node:fs";
import path from "node:path";
import type { ImageEntry } from "@/lib/images/registry";
import { result } from "./types";

export function imagesCheck(images: Map<string, ImageEntry>, publicDir: string) {
  const r = result("images");
  for (const img of images.values()) {
    if (!fs.existsSync(path.join(publicDir, img.src))) r.errors.push(`image "${img.id}": file ${img.src} not found in public/`);
    if (img.aiGenerated && /photo/i.test(img.caption ?? "")) r.errors.push(`image "${img.id}": AI image caption must not call it a photo`);
  }
  return r;
}
