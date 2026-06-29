console.log("STEP 1");

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("STEP 2");

    const accessToken = body.accessToken;
    console.log("STEP 3");
    const fileId = body.fileId;
    console.log("STEP 4");
    const fileName = body.fileName;
    console.log("STEP 5");
    const caption = body.caption || "";

    if (!accessToken || !fileId || !fileName) {
      return NextResponse.json(
        { error: "Missing Drive access token, file ID, or file name" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: platformData } = await supabaseAdmin
      .from("connected_platforms")
      .select("facebook_page_id, facebook_page_token")
      .eq("platform", "Facebook")
      .maybeSingle();
      console.log("PLATFORM DATA:", JSON.stringify(platformData));

    if (!platformData?.facebook_page_id || !platformData?.facebook_page_token) {
      return NextResponse.json(
        { error: "Facebook Page ID or token not found" },
        { status: 400 }
      );
    }

    const pageId = platformData.facebook_page_id;
    const pageToken = platformData.facebook_page_token;

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
        { error: "Failed to download video from Google Drive" },
        { status: 500 }
      );
    }

    const videoBuffer = await driveRes.arrayBuffer();

    const safeFileName = `${Date.now()}-${fileName.replace(
      /[^a-zA-Z0-9.\-_]/g,
      "_"
    )}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("karvian-media")
      .upload(safeFileName, videoBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: "Failed to upload video to Supabase Storage",
          details: uploadError,
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("karvian-media")
      .getPublicUrl(safeFileName);

    const publicVideoUrl = publicData.publicUrl;
    console.log("FACEBOOK URL:", `https://graph.facebook.com/v21.0/${pageId}/videos`);
console.log("PUBLIC VIDEO URL:", publicVideoUrl);

    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/videos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_url: publicVideoUrl,
          description: caption,
          access_token: pageToken,
        }),
      }
    );

    const fbData = await fbRes.json();
    console.log("FACEBOOK RESPONSE:", fbData);
    
    console.log("Facebook publish response:", fbData);

   if (!fbRes.ok) {
  throw new Error(JSON.stringify(fbData));
}

    return NextResponse.json({
      success: true,
      message: "Facebook video published successfully",
      facebookVideoId: fbData.id,
      facebookUrl: `https://www.facebook.com/${pageId}/videos/${fbData.id}`,
      publicVideoUrl,
    });
  } catch (error) {
  console.error("FULL FACEBOOK ERROR:");
  console.error(error);

  throw error;
}
}