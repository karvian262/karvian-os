import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();

  const accessToken = body.accessToken;
  const fileId = body.fileId;
  const fileName = body.fileName;

  if (!accessToken || !fileId || !fileName) {
    return NextResponse.json(
      { error: "Missing required data" },
      { status: 400 }
    );
  }

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!driveRes.ok) {
    return NextResponse.json(
      { error: "Failed to download file from Google Drive" },
      { status: 500 }
    );
  }

  const fileBuffer = await driveRes.arrayBuffer();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const safeFileName = `${Date.now()}-${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from("karvian-media")
    .upload(safeFileName, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    return NextResponse.json(
      { error: "Failed to upload to Supabase Storage", details: error },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage
    .from("karvian-media")
    .getPublicUrl(safeFileName);

  return NextResponse.json({
    message: "File uploaded to storage",
    publicUrl: data.publicUrl,
  });
}