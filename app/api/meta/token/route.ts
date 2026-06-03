import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const code = body.code;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_META_REDIRECT_URI}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: "Meta token exchange failed", details: data },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}