"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      setEmail(user.email);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-white/10 bg-black p-6 text-white">
      <div>
        <h1 className="whitespace-nowrap text-xl font-bold tracking-[0.15em]">
          KARVIAN OS
        </h1>

        <nav className="mt-10 space-y-3">
          <Link href="/dashboard" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Dashboard
          </Link>

          <Link href="/drive" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Content Library
          </Link>

          <Link href="/calendar" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Calendar
          </Link>

          <Link href="/platforms" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Platforms
          </Link>

          <Link href="/analytics" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Analytics
          </Link>

          <Link href="/workspace" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Workspace
          </Link>

          <Link href="/settings" className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white">
            Settings
          </Link>
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 pt-5">
        <p className="truncate text-xs text-gray-400">{email || "Logged in"}</p>

        <button
          onClick={logout}
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-left text-black hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}