const mediaItems = [
  { name: "Dark Divinity Trailer", type: "Video", status: "Ready", tag: "Drop" },
  { name: "Ben10 Tee Shoot", type: "Image", status: "Draft", tag: "Product" },
  { name: "KAER Reel 01", type: "Video", status: "Posted", tag: "Instagram" },
  { name: "Anime Tee Back Print", type: "Image", status: "Ready", tag: "Website" },
  { name: "Streetwear Model Shot", type: "Image", status: "Draft", tag: "Campaign" },
  { name: "Drop Teaser Edit", type: "Video", status: "Scheduled", tag: "YouTube" },
];

export default function MediaPage() {
  return (
    <div className="p-8 text-white">
      <p className="text-gray-400">Content Library</p>
      <h1 className="mt-2 text-5xl font-bold">Media Library</h1>

      <div className="mt-8 flex gap-3">
        <button className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black">
          Upload Media
        </button>
        <button className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300">
          Connect Google Drive
        </button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {mediaItems.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-3xl border border-white/10 bg-[#151515]"
          >
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-neutral-900 to-black text-gray-500">
              {item.type}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium">{item.name}</h2>
                <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-300">
                  {item.tag}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-400">{item.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}