"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CalendarPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getPosts();
  }, []);

  async function getPosts() {
    const { data, error } = await supabase
      .from("media_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPosts(data || []);
  }

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Content Planning</p>
      <h1 className="mt-2 text-5xl font-bold">Content Calendar</h1>

      <div className="mt-10 grid gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl border border-white/10 bg-[#151515] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{post.file_name}</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {post.platform} • {post.post_type}
                </p>
              </div>

              <span
                className={
                  post.status === "posted"
                    ? "rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300"
                    : "rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300"
                }
              >
                {post.status}
              </span>
            </div>

            {post.caption && (
              <p className="mt-4 text-gray-300">{post.caption}</p>
            )}

            <p className="mt-4 text-sm text-gray-500">
              Scheduled: {post.scheduled_time || "Not scheduled"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}