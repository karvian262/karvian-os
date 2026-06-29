"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function MetaCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    saveMetaConnection();
  }, []);

  async function saveMetaConnection() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const platform = params.get("state") || "Meta";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (code && user) {
      const res = await fetch("/api/meta/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const tokenData = await res.json();

      if (!res.ok) {
        console.log(tokenData);
        router.push("/platforms");
        return;
      }

      await supabase.from("connected_platforms").upsert([
  {
    user_id: user.id,
    platform: platform,
    account_name: tokenData.page_name || "Meta connected account",
    connected: true,
    access_token: tokenData.access_token,
    ...(tokenData.facebook_page_id && { facebook_page_id: tokenData.facebook_page_id }),
    ...(tokenData.facebook_page_token && { facebook_page_token: tokenData.facebook_page_token }),
  },
]);
    }

    router.push("/platforms");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold">Connecting Meta Account...</h1>
    </div>
  );
}