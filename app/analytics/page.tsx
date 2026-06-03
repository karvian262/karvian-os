const analytics = [
  { platform: "YouTube", post: "Dark Divinity Trailer", views: "1.2K", likes: 143, comments: 18 },
  { platform: "Instagram", post: "KAER Reel 01", views: "3.8K", likes: 420, comments: 36 },
  { platform: "Facebook", post: "Drop Announcement", views: "950", likes: 87, comments: 9 },
  { platform: "Pinterest", post: "T-shirt Catalog Pin", views: "2.1K", likes: 210, comments: 5 },
  { platform: "Moj", post: "Streetwear Edit", views: "780", likes: 66, comments: 3 },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#070707] p-8 text-white">
      <h1 className="text-4xl font-semibold">Analytics</h1>
      <p className="mt-2 text-gray-400">
        Track views, likes, and comments from every platform.
      </p>

      <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-5 border-b border-white/10 p-4 text-sm text-gray-400">
          <p>Platform</p>
          <p>Post</p>
          <p>Views</p>
          <p>Likes</p>
          <p>Comments</p>
        </div>

        {analytics.map((item) => (
          <div
            key={item.post}
            className="grid grid-cols-5 border-b border-white/5 p-4 text-sm"
          >
            <p>{item.platform}</p>
            <p className="text-gray-300">{item.post}</p>
            <p>{item.views}</p>
            <p>{item.likes}</p>
            <p>{item.comments}</p>
          </div>
        ))}
      </div>
    </main>
  );
}