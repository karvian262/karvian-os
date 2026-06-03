"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  async function connectGoogleDrive() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/onboarding",
        scopes: "https://www.googleapis.com/auth/drive.readonly",
        queryParams: {
          prompt: "consent select_account",
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#070707] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Welcome to Karvian OS
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Let's set up your workspace
        </h1>

        <p className="mt-4 text-lg text-gray-400">
          Connect your content sources and publishing platforms.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#151515] p-8">
            <p className="text-sm text-gray-500">STEP 1</p>
            <h2 className="mt-2 text-3xl font-bold">
              Connect Content Sources
            </h2>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-black/30 p-5">
                <h3 className="font-semibold">Google Drive</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Sync photos, videos and content assets.
                </p>

                <button
                  onClick={connectGoogleDrive}
                  className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-gray-200"
                >
                  Connect Google Drive
                </button>
              </div>

              {["Dropbox", "OneDrive", "Local Uploads"].map((source) => (
                <div key={source} className="rounded-2xl bg-black/30 p-5 opacity-70">
                  <h3 className="font-semibold">{source}</h3>
                  <p className="mt-2 text-sm text-gray-400">Coming soon</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#151515] p-8">
            <p className="text-sm text-gray-500">STEP 2</p>
            <h2 className="mt-2 text-3xl font-bold">Connect Platforms</h2>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "YouTube",
                "Instagram",
                "Facebook",
                "Pinterest",
                "X / Twitter",
                "LinkedIn",
                "TikTok",
                "WhatsApp Business",
                "Telegram",
                "Moj",
                "Josh",
                "Snapchat",
              ].map((platform) => (
                <div
                  key={platform}
                  className="rounded-2xl bg-black/30 p-5 text-center"
                >
                  {platform}
                </div>
              ))}
            </div>

            <Link
              href="/platforms"
              className="mt-8 block rounded-xl bg-white px-5 py-3 text-center font-medium text-black hover:bg-gray-200"
            >
              Connect Platforms
            </Link>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-8 py-4 font-semibold text-black hover:bg-gray-200"
          >
            Continue to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}