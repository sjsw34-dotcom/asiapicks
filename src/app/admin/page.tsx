"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Post {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string | null;
  published_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/posts", {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (!res.ok) {
        setError("Invalid password");
        setAuthed(false);
        sessionStorage.removeItem("admin_pw");
        return;
      }
      const data = await res.json();
      setPosts(data.posts);
      setAuthed(true);
      sessionStorage.setItem("admin_pw", pw);
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      fetchPosts(saved);
    }
  }, [fetchPosts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(password);
  };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Blog Posts ({posts.length})
        </h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("admin_pw");
            setAuthed(false);
          }}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          Logout
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/posts/${post.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-primary transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {post.image ? (
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-red-500 font-medium">
                  No img
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-text-primary truncate">
                {post.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {post.category}
                </span>
                <span className="text-xs text-text-secondary">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <span className="text-text-secondary">&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
