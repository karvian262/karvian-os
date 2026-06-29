import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const accessToken = body.accessToken;
    const fileId = body.fileId;
    const fileName = body.fileName;
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
      .select("instagram_token")
      .eq("platform", "Instagram")
      .maybeSingle();

    if (!platformData?.instagram_token) {
      return NextResponse.json(
        { error: "Instagram token not found. Save token first." },
        { status: 400 }
      );
    }

    const instagramToken = platformData.instagram_token;
    console.log("TOKEN START:", instagramToken.substring(0, 20));

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

    const igAccountId = "27048784698117640";

    const createContainerRes = await fetch(
      `https://graph.instagram.com/v25.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: publicVideoUrl,
          caption,
          access_token: instagramToken,
        }),
      }
    );

    const containerData = await createContainerRes.json();
    console.log("Instagram container response:", containerData);

    if (!createContainerRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to create Instagram media container",
          details: containerData,
          publicVideoUrl,
        },
        { status: 500 }
      );
    }
await new Promise((resolve) => setTimeout(resolve, 120000));
    const publishRes = await fetch(
      `https://graph.instagram.com/v25.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: instagramToken,
        }),
      }
    );

    const publishData = await publishRes.json();
    console.log("Instagram publish response:", publishData);

    if (!publishRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to publish Instagram Reel",
          details: publishData,
          publicVideoUrl,
          creationId: containerData.id,
        },
        { status: 500 }
      );
    }
    await supabaseAdmin.from("media_posts").insert({
  platform: "Instagram",
  title: fileName,
  instagram_media_id: publishData.id,
  instagram_url: `https://www.instagram.com/reel/${publishData.id}/`,
});

    return NextResponse.json({
  success: true,
  message: "Instagram Reel published successfully",
  instagramMediaId: publishData.id,
  instagramUrl: `https://www.instagram.com/reel/${publishData.id}/`,
  publicVideoUrl,
});
  } catch (error) {
    return NextResponse.json(
      {
        error: "Instagram publish route crashed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}