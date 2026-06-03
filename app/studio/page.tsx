const videos = [
  {
    title: "Dark Divinity Trailer",
    platform: "YouTube",
    views: "1.2K",
    likes: 143,
    comments: [
      { user: "Aman", text: "This drop looks insane 🔥" },
      { user: "Riya", text: "When is it launching?" },
    ],
  },
  {
    title: "KAER Reel 01",
    platform: "Instagram",
    views: "3.8K",
    likes: 420,
    comments: [
      { user: "Dev", text: "Need this tee bro" },
      { user: "Sneha", text: "The vibe is premium" },
    ],
  },
];

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#070707] p-8 text-white">
      <h1 className="text-4xl font-semibold">Studio Inbox</h1>
      <p className="mt-2 text-gray-400">
        Manage posted videos, check engagement, and reply to comments.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {videos.map((video) => (
          <div
            key={video.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-48 rounded-2xl bg-neutral-800" />

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">{video.title}</h2>
                <p className="mt-1 text-sm text-gray-400">{video.platform}</p>
              </div>

              <div className="rounded-full bg-purple-500/15 px-3 py-1 text-sm text-purple-300">
                Posted
              </div>
            </div>

            <div className="mt-5 flex gap-4 text-sm text-gray-300">
              <p>{video.views} views</p>
              <p>{video.likes} likes</p>
              <p>{video.comments.length} comments</p>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400">Comments</h3>

              {video.comments.map((comment) => (
                <div
                  key={comment.user}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="font-medium">{comment.user}</p>
                  <p className="mt-1 text-sm text-gray-300">{comment.text}</p>

                  <div className="mt-3 flex gap-2">
                    <input
                      placeholder="Write a reply..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-gray-600"
                    />
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}