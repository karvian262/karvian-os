"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: postData } = await supabase
      .from("media_posts")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: platformData } = await supabase
      .from("connected_platforms")
      .select("*");

    setPosts(postData || []);
    setPlatforms(platformData || []);
  }

  const totalPosts = posts.length;
  const scheduledPosts = posts.filter((post) => post.status === "scheduled").length;
  const postedPosts = posts.filter((post) => post.status === "posted").length;
  const connectedPlatforms = platforms.filter((p) => p.connected).length;

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Karvian OS Command Center</p>
      <h1 className="mt-2 text-5xl font-bold">Dashboard</h1>

      <div className="mt-10 grid grid-cols-4 gap-6">
        <Stat title="Connected Platforms" value={connectedPlatforms} />
        <Stat title="Total Posts" value={totalPosts} />
        <Stat title="Scheduled" value={scheduledPosts} color="text-yellow-400" />
        <Stat title="Posted" value={postedPosts} color="text-green-400" />
      </div>

      <div className="mt-10 grid grid-cols-4 gap-4">
        <Quick href="/drive" title="Open Content Library" />
        <Quick href="/platforms" title="Connect Platform" />
        <Quick href="/calendar" title="View Calendar" />
        <Quick href="/workspace" title="Workspace" />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-2xl font-semibold">Upcoming Schedule</h2>

          <div className="mt-6 space-y-4">
            {posts.filter((p) => p.status === "scheduled").slice(0, 5).map((post) => (
              <div key={post.id} className="rounded-2xl bg-black/30 p-4">
                <p className="font-medium">{post.file_name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {post.platform} • {post.scheduled_time || "No time selected"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>

          <div className="mt-6 space-y-4">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="rounded-2xl bg-black/30 p-4">
                <p className="font-medium">{post.file_name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {post.platform} • {post.status}
                </p>
                {post.youtube_url && (
  <a
    href={post.youtube_url}
    target="_blank"
    className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
  >
    View Video
  </a>
)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, color = "text-white" }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className={`mt-4 text-5xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function Quick({ href, title }: any) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-[#151515] p-5 text-center font-medium text-gray-300 hover:bg-white/10 hover:text-white"
    >
      {title}
    </Link>
  );
}