import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const accessToken = body.accessToken;
  const folderId = body.folderId;
  const source = body.source || "computers";

  const fields =
    "files(id,name,mimeType,parents,thumbnailLink,webViewLink,iconLink)";

  if (folderId && folderId !== "root") {
    const query = encodeURIComponent(
      `'${folderId}' in parents and trashed = false`
    );

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=200&fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();

    return NextResponse.json({
      files: data.files || [],
    });
  }

  if (source === "mydrive") {
    const query = encodeURIComponent(
      `'root' in parents and trashed = false`
    );

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=200&fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();

    return NextResponse.json({
      files: data.files || [],
    });
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=200&fields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  const computerFolders = (data.files || []).filter(
    (file: any) =>
      file.mimeType === "application/vnd.google-apps.folder" &&
      (!file.parents || file.parents.length === 0)
  );

  return NextResponse.json({
    files: computerFolders,
  });
}