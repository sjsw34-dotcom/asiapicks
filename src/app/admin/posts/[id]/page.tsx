"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string | null;
  country: string | null;
  tags: string[];
  content: string;
  image: string | null;
  read_time: number;
  published_at: string;
}

const CATEGORIES = [
  "travel-guides",
  "hotels-stays",
  "activities-tours",
  "travel-tips",
  "saju-travel",
];

export default function AdminEditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    country: "",
    tags: "",
    image: "",
    read_time: 5,
    content: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const pw = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") : null;

  const fetchPost = useCallback(async () => {
    if (!pw) return;
    const res = await fetch(`/api/admin/posts/${id}`, {
      headers: { Authorization: `Bearer ${pw}` },
    });
    if (!res.ok) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    const p = data.post as Post;
    setPost(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      category: p.category,
      city: p.city ?? "",
      country: p.country ?? "",
      tags: (p.tags ?? []).join(", "),
      image: p.image ?? "",
      read_time: p.read_time,
      content: p.content,
    });
  }, [id, pw, router]);

  useEffect(() => {
    if (!pw) {
      router.push("/admin");
      return;
    }
    fetchPost();
  }, [pw, fetchPost, router]);

  const handleSave = async () => {
    if (!pw) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pw}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          city: form.city || null,
          country: form.country || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          image: form.image || null,
          read_time: Number(form.read_time),
          content: form.content,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage({ type: "success", text: "Saved!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pw) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    await fetch(`/api/admin/posts/${id}/delete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pw}` },
    });
    router.push("/admin");
  };

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-text-secondary">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="text-sm text-primary hover:underline">
          &larr; Back to list
        </Link>
        <div className="flex items-center gap-3">
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-primary"
          >
            View post &rarr;
          </a>
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <h1 className="text-xl font-bold text-text-primary mb-6">Edit Post</h1>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-xs text-text-secondary mt-1 block">
            {form.description.length}/160 chars
          </span>
        </div>

        {/* Image URL + Preview */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Hero Image URL
          </label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {form.image && (
            <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Category + Read Time row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Read Time (min)
            </label>
            <input
              type="number"
              value={form.read_time}
              onChange={(e) =>
                setForm({ ...form, read_time: Number(e.target.value) })
              }
              min={1}
              max={30}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* City + Country row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="tokyo"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="japan"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tokyo, japan, capsule-hotels"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Content (Markdown)
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={20}
            className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            style={{ minHeight: "400px" }}
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <span className="text-xs text-text-secondary">
            slug: {post.slug} (not editable)
          </span>
        </div>
      </div>
    </div>
  );
}
