"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function InstagramSettingsPage() {
  const [token, setToken] = useState("");

  async function saveToken() {
    const { error } = await supabase
      .from("connected_platforms")
      .update({ instagram_token: token })
      .eq("platform", "Instagram");

    if (error) {
      alert("Failed to save token");
      console.log(error);
      return;
    }

    alert("Instagram token saved");
    setToken("");
  }

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Settings</p>
      <h1 className="mt-2 text-5xl font-bold">Instagram Token</h1>

      <div className="mt-10 rounded-3xl border border-white/10 bg-[#151515] p-8">
        <p className="text-sm text-gray-400">Paste Instagram Access Token</p>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="mt-4 h-40 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white"
          placeholder="Paste token here..."
        />

        <button
          onClick={saveToken}
          className="mt-6 rounded-xl bg-white px-6 py-3 font-medium text-black"
        >
          Save Token
        </button>
      </div>
    </div>
  );
}