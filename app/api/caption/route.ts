import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const fileName = body.fileName;
  const platform = body.platform;

  const captions: any = {
    YouTube: `🔥 New video drop: ${fileName}\n\nWatch now and don't forget to subscribe 🚀`,
    
    Instagram: `✨ ${fileName}\n\nDrop a ❤️ if you vibe with this reel.\n#viral #reels #explore`,
    
    Pinterest: `Save this for inspiration 📌\n${fileName}`,
    
    Facebook: `New content uploaded 🚀\n${fileName}`,
    
    Moj: `🔥 Trending now\n${fileName}\n#moj #viral`,
  };

  return NextResponse.json({
    caption:
      captions[platform] ||
      `Check this out: ${fileName}`,
  });
}