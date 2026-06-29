import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const code = body.code;

  // 1. Short-lived token
  const res = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_META_REDIRECT_URI}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
  );
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: "Token exchange failed", details: data }, { status: 500 });
  }

  // 2. Long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${data.access_token}`
  );
  const longData = await longRes.json();
  const longToken = longData.access_token || data.access_token;

  // 3. Get Page token directly
  const pageRes = await fetch(
    `https://graph.facebook.com/v21.0/1198847039973079?fields=id,name,access_token&access_token=${longToken}`
  );
  const pageData = await pageRes.json();
  console.log("PAGE DATA:", JSON.stringify(pageData));

  return NextResponse.json({
    access_token: longToken,
    facebook_page_id: pageData.id || null,
    facebook_page_token: pageData.access_token || null,
    page_name: pageData.name || null,
  });
}