"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const platforms = [
  {
    name: "YouTube",
    type: "Video Platform",
    icon: "▶",
    color: "text-red-500",
    method: "Connect with Google",
    note: "For videos and Shorts publishing.",
  },
  {
    name: "Instagram",
    type: "Social Platform",
    icon: "◎",
    color: "text-pink-500",
    method: "Connect with Meta",
    note: "⚠️ META API REQUIREMENT: Only Creator and Business accounts can publish through Karvian OS. Personal accounts are NOT supported.",
  },
  {
    name: "Facebook",
    type: "Social Platform",
    icon: "f",
    color: "text-blue-500",
    method: "Connect with Meta",
    note: "⚠️ META API REQUIREMENT: Publishing works through Facebook Pages. Personal Facebook profiles cannot publish through Meta APIs.",
  },
  {
    name: "Pinterest",
    type: "Visual Discovery",
    icon: "P",
    color: "text-red-600",
    method: "Connect with Pinterest",
    note: "For pins and visual content.",
  },
  {
    name: "X / Twitter",
    type: "Text + Media",
    icon: "𝕏",
    color: "text-white",
    method: "Connect with X",
    note: "For text posts, images and videos.",
  },
  {
    name: "LinkedIn",
    type: "Business Platform",
    icon: "in",
    color: "text-blue-400",
    method: "Connect with LinkedIn",
    note: "For creators, founders and company pages.",
  },
  {
    name: "WhatsApp Business",
    type: "Messaging",
    icon: "☏",
    color: "text-green-500",
    method: "Connect Phone Number",
    note: "For broadcasts, campaigns and customer updates.",
  },
  {
    name: "Telegram",
    type: "Community",
    icon: "✈",
    color: "text-sky-500",
    method: "Connect Bot / Channel",
    note: "For channel announcements and communities.",
  },
  {
    name: "Moj",
    type: "Short Video",
    icon: "M",
    color: "text-orange-500",
    method: "Partner API Later",
    note: "Short-video publishing support planned.",
  },
];

export default function PlatformsPage() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);

  useEffect(() => {
    getConnectedPlatforms();
  }, []);

  async function getConnectedPlatforms() {
    const { data, error } = await supabase
      .from("connected_platforms")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setConnectedPlatforms(data || []);
  }

  async function connectPlatform(platformName: string) {
  if (platformName === "YouTube") {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/platforms?connected=youtube",
        scopes:
          "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/youtube.upload",
        queryParams: {
          prompt: "consent select_account",
          access_type: "offline",
        },
      },
    });

    return;
  }

  if (platformName === "Instagram" || platformName === "Facebook") {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;

    const scope = "public_profile";

    const metaUrl =
      `https://www.facebook.com/v21.0/dialog/oauth` +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri || "")}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&response_type=code` +
`&state=${encodeURIComponent(platformName)}`;

    window.location.href = metaUrl;
    return;
  }

  alert(`${platformName} real connection will be added later.`);
}

  async function disconnectPlatform(platformName: string) {
    const { error } = await supabase
      .from("connected_platforms")
      .delete()
      .eq("platform", platformName);

    if (error) {
      alert("Failed to disconnect");
      console.log(error);
      return;
    }

    await getConnectedPlatforms();
  }

  function getConnection(platformName: string) {
    return connectedPlatforms.find(
      (item) => item.platform === platformName && item.connected === true
    );
  }

  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Account Connections</p>

      <h1 className="mt-2 text-5xl font-bold">Platforms</h1>

      <p className="mt-3 text-gray-500">
        Connect publishing accounts to Karvian OS.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => {
          const connection = getConnection(platform.name);

          return (
            <div
              key={platform.name}
              className="rounded-3xl border border-white/10 bg-[#151515] p-6 transition hover:border-white/20 hover:bg-[#1a1a1a]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/30">
                  <span className={`text-3xl font-bold ${platform.color}`}>
                    {platform.icon}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{platform.name}</h2>
                  <p className="text-sm text-gray-400">{platform.type}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-black/30 p-4">
                <p className="text-sm text-gray-500">Connection Method</p>
                <p className="mt-1 font-medium text-white">
                  {platform.method}
                </p>
                <p className="mt-3 text-sm font-bold text-yellow-400">
  {platform.note}
</p>
              </div>

              <div className="mt-4 rounded-2xl bg-black/30 p-4">
                <p className="text-sm text-gray-500">Status</p>

                {connection ? (
                  <>
                    <p className="mt-1 font-medium text-green-400">
                      Connected
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {connection.account_name}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 font-medium text-yellow-400">
                    Not Connected
                  </p>
                )}
              </div>

              {connection ? (
                <button
                  onClick={() => disconnectPlatform(platform.name)}
                  className="mt-5 w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-300 hover:bg-red-500/20"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectPlatform(platform.name)}
                  className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-gray-200"
                >
                  {platform.method}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}