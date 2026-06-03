"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function WorkspacePage() {
  const [email, setEmail] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) setEmail(user.email);

    const { data: postData } = await supabase.from("media_posts").select("*");
    const { data: platformData } = await supabase
      .from("connected_platforms")
      .select("*");

    setPosts(postData || []);
    setPlatforms(platformData || []);
  }

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Workspace Management</p>
      <h1 className="mt-2 text-5xl font-bold">Workspace</h1>

      <div className="mt-10 rounded-3xl border border-white/10 bg-[#151515] p-8">
        <p className="text-sm text-gray-400">Workspace Name</p>
        <h2 className="mt-2 text-3xl font-bold">My Workspace</h2>

        <p className="mt-6 text-sm text-gray-400">Owner</p>
        <p className="mt-2 text-lg">{email}</p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
          <p className="text-gray-400">Plan</p>
          <h2 className="mt-3 text-3xl font-bold">Free</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
          <p className="text-gray-400">Connected Platforms</p>
          <h2 className="mt-3 text-3xl font-bold">{platforms.length}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
          <p className="text-gray-400">Total Posts</p>
          <h2 className="mt-3 text-3xl font-bold">{posts.length}</h2>
        </div>
      </div>
    </div>
  );
}