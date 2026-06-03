import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const accessToken = body.accessToken;
  const fileId = body.fileId;
  const fileName = body.fileName;
  const caption = body.caption || "";
  const postType = body.postType || "Video";

  if (!accessToken || !fileId) {
    return NextResponse.json(
      { error: "Missing access token or file ID" },
      { status: 400 }
    );
  }

  const driveFileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!driveFileRes.ok) {
    return NextResponse.json(
      { error: "Failed to download video from Google Drive" },
      { status: 500 }
    );
  }

  const videoBuffer = await driveFileRes.arrayBuffer();

  const metadata = {
    snippet: {
      title: fileName,
      description: caption,
      categoryId: "22",
    },
    status: {
      privacyStatus: "private",
      selfDeclaredMadeForKids: false,
    },
  };

  const boundary = "karvian_boundary";

  const bodyStart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: video/*\r\n\r\n`;

  const bodyEnd = `\r\n--${boundary}--`;

  const uploadBody = new Blob([
    bodyStart,
    videoBuffer,
    bodyEnd,
  ]);

  const youtubeRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: uploadBody,
    }
  );

  const youtubeData = await youtubeRes.json();

  if (!youtubeRes.ok) {
    console.log(youtubeData);

    return NextResponse.json(
      {
        error: "YouTube upload failed",
        details: youtubeData,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `${postType} uploaded to YouTube successfully`,
    videoId: youtubeData.id,
    videoUrl: `https://www.youtube.com/watch?v=${youtubeData.id}`,
  });
}