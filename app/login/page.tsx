"use client";

import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/onboarding",
        scopes:
          "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/youtube.upload",
      queryParams: {
  prompt: "consent select_account",
  access_type: "offline",
},
},
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#151515] p-8">
        <h1 className="text-4xl font-bold">
          KARVIAN OS
        </h1>

        <p className="mt-3 text-gray-400">
          Login to access your creator dashboard.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-medium text-black transition hover:bg-gray-200"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}