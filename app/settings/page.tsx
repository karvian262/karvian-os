"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) setEmail(user.email);
  }

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Account Preferences</p>
      <h1 className="mt-2 text-5xl font-bold">Settings</h1>

      <div className="mt-10 rounded-3xl border border-white/10 bg-[#151515] p-8">
        <h2 className="text-2xl font-semibold">Profile</h2>

        <div className="mt-6">
          <p className="text-sm text-gray-400">Email</p>
          <p className="mt-2 text-lg">{email}</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#151515] p-8">
        <h2 className="text-2xl font-semibold">Workspace Defaults</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-gray-400">Workspace Name</p>
            <input
              defaultValue="My Workspace"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-400">Timezone</p>
            <input
              defaultValue="Asia/Kolkata"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>
        </div>

        <button className="mt-8 rounded-xl bg-white px-5 py-3 font-medium text-black">
          Save Settings
        </button>
      </div>
    </div>
  );
}