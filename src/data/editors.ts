import { absoluteUrl } from "@/lib/site";

export type Editor = { id: string; name: string; kind: "Person" | "Organization"; url: string; bio: string };

export const EDITORS: Editor[] = [
  {
    id: "editorial",
    name: "AsiaPicks Editorial Team",
    kind: "Organization",
    url: absoluteUrl("/about"),
    bio: "AsiaPicks researches every guide against official Korean sources and reviews each page before publishing.",
  },
];

export function getEditor(id: string): Editor {
  const editor = EDITORS.find((e) => e.id === id);
  if (!editor) throw new Error(`Unknown editor id: ${id}`);
  return editor;
}
