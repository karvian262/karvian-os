"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  iconLink?: string;
};

type UploadTask = {
  id: number;
  fileName: string;
  thumbnail?: string;
  platform: string;
  postType: string;
  progress: number;
  status: "uploading" | "done" | "failed";
};

export default function DrivePage() {
  const [userEmail, setUserEmail] = useState("");
  const [view, setView] = useState<"home" | "driveRoot" | "files">("home");
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  const [selectedSource, setSelectedSource] = useState<"computers" | "mydrive">("computers");
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [folderName, setFolderName] = useState("");

  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [postType, setPostType] = useState("Short");
  const [caption, setCaption] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

  useEffect(() => {
    getUser();
    getScheduledPosts();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) setUserEmail(user.email);
  }

  async function getScheduledPosts() {
    const { data, error } = await supabase.from("media_posts").select("*");
    if (error) return console.log(error);
    setScheduledPosts(data || []);
  }

  async function fetchDriveFiles(
    folderId = "root",
    name = "My Drive",
    source: "computers" | "mydrive" = "mydrive"
  ) {
    setIsSyncing(true);

    const { data } = await supabase.auth.getSession();
    const providerToken = data.session?.provider_token;

    if (!providerToken) {
      alert("No Google Drive token found. Login again with Drive permission.");
      setIsSyncing(false);
      return;
    }

    const res = await fetch("/api/drive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: providerToken, folderId, source }),
    });

    const result = await res.json();

    setDriveFiles(result.files || []);
    setSelectedSource(source);
    setCurrentFolderId(folderId);
    setFolderName(name);
    setView("files");
    setIsSyncing(false);
  }

  function openFolder(file: DriveFile) {
    fetchDriveFiles(file.id, file.name, selectedSource);
  }

  function openPostModal(file: DriveFile, platform: string) {
    setSelectedFile(file);
    setSelectedPlatform(platform);
    setPostType(platform === "YouTube" ? "Short" : "Reel");
    setCaption("");
    setScheduleTime("");
  }

  async function generateCaption() {
    if (!selectedFile) return;

    setIsGeneratingCaption(true);

    const res = await fetch("/api/caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: selectedFile.name,
        platform: selectedPlatform,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    setCaption(data.caption || "");
    setIsGeneratingCaption(false);
  }

  async function savePostSchedule() {
    if (!selectedFile) return;

    const { error } = await supabase.from("media_posts").insert([
      {
        drive_file_id: selectedFile.id,
        file_name: selectedFile.name,
        file_type: selectedFile.mimeType,
        platform: selectedPlatform,
        post_type: postType,
        caption,
        scheduled: true,
        scheduled_time: scheduleTime || null,
        status: "scheduled",
      },
    ]);

    if (error) {
      alert("Failed to save schedule");
      console.log(error);
      return;
    }

    await getScheduledPosts();
    alert(`${selectedPlatform} scheduled successfully`);
    setSelectedFile(null);
  }

  async function postNow() {
    if (!selectedFile) return;

    const fileToPost = selectedFile;
    const platformToPost = selectedPlatform;
    const taskId = Date.now();

    setPosting(true);

    setUploadTasks((prev) => [
      ...prev,
      {
        id: taskId,
        fileName: fileToPost.name,
        thumbnail: fileToPost.thumbnailLink,
        platform: platformToPost,
        postType,
        progress: 0,
        status: "uploading",
      },
    ]);

    setSelectedFile(null);

    const progressInterval = setInterval(() => {
  setUploadTasks((prev) =>
    prev.map((task) =>
      task.id === taskId && task.progress < 90
        ? { ...task, progress: task.progress + 1 }
        : task
    )
  );
}, 1500);

    try {
      const { data } = await supabase.auth.getSession();
      const providerToken = data.session?.provider_token;

      if (!providerToken) {
        alert("No Google token found. Login again with YouTube permission.");
        setUploadTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: "failed" } : task
          )
        );
        return;
      }

      let youtubeVideoId = null;
      let youtubeUrl = null;

      if (platformToPost === "YouTube") {
        const res = await fetch("/api/youtube", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: providerToken,
            fileId: fileToPost.id,
            fileName: fileToPost.name,
            caption,
            postType,
          }),
        });

        const uploadData = await res.json();

        if (!res.ok) {
          alert(uploadData.error || "YouTube upload failed");
          console.log(uploadData);
          setUploadTasks((prev) =>
            prev.map((task) =>
              task.id === taskId ? { ...task, status: "failed" } : task
            )
          );
          return;
        }

        youtubeVideoId = uploadData.videoId;
        youtubeUrl = uploadData.videoUrl;

        alert(`${uploadData.message}\n${uploadData.videoUrl}`);
      }

      if (platformToPost === "Instagram") {
        const res = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: providerToken,
            fileId: fileToPost.id,
            fileName: fileToPost.name,
            caption,
          }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          alert(data.error || "Instagram publish failed");
          console.log(data);
          setUploadTasks((prev) =>
            prev.map((task) =>
              task.id === taskId ? { ...task, status: "failed" } : task
            )
          );
          return;
        }

        alert(data.message || "Instagram Reel published successfully");
      }
if (platformToPost === "Facebook") {
  const res = await fetch("/api/facebook/publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: providerToken,
      fileId: fileToPost.id,
      fileName: fileToPost.name,
      caption,
    }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    alert(data.error || "Facebook publish failed");
    console.log(data);
    setUploadTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "failed" } : task
      )
    );
    return;
  }

  alert(data.message || "Facebook video published successfully");
}
      const { error } = await supabase.from("media_posts").insert([
        {
          drive_file_id: fileToPost.id,
          file_name: fileToPost.name,
          file_type: fileToPost.mimeType,
          platform: platformToPost,
          post_type: postType,
          caption,
          scheduled: false,
          status: "posted",
          youtube_video_id: youtubeVideoId,
          youtube_url: youtubeUrl,
        },
      ]);

      if (error) {
        alert("Failed to mark as posted");
        console.log(error);
        setUploadTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: "failed" } : task
          )
        );
        return;
      }

      await getScheduledPosts();

      setUploadTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, progress: 100, status: "done" }
            : task
        )
      );
      new Audio("/notification.mp3").play().catch(() => {});
      setTimeout(() => {
  setUploadTasks((prev) =>
    prev.filter((task) => task.id !== taskId)
  );
}, 3000);
    } finally {
      clearInterval(progressInterval);
      setPosting(false);
    }
  }

  async function cancelSchedule(postId: number) {
    const { error } = await supabase
      .from("media_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      alert("Failed to cancel schedule");
      console.log(error);
      return;
    }

    await getScheduledPosts();
    alert("Schedule cancelled");
  }

  return (
    <>
      <div className="p-8 text-white">
        <p className="text-gray-400">Karvian OS</p>
        <h1 className="mt-2 text-5xl font-bold">Content Library</h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#151515] p-6">
          <p className="text-sm text-gray-400">Connected Account</p>
          <h2 className="mt-2 text-2xl font-semibold">{userEmail}</h2>
        </div>

        {view === "home" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
              <p className="text-sm text-gray-500">SECTION 1</p>
              <h2 className="mt-2 text-3xl font-bold">Google Storage</h2>

              <div className="mt-6 rounded-2xl bg-black/30 p-5">
                <h3 className="text-xl font-semibold">Google Drive</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Access My Drive and Computers backup folders.
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={async () => {
                      await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: "http://localhost:3000/drive",
                          scopes:
                            "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/youtube.upload",
                          queryParams: {
                            prompt: "consent select_account",
                            access_type: "offline",
                          },
                        },
                      });
                    }}
                    className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 hover:bg-white/10"
                  >
                    Connect Drive
                  </button>

                  <button
                    onClick={() => setView("driveRoot")}
                    className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-gray-200"
                  >
                    Drive Sync
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#151515] p-6">
              <p className="text-sm text-gray-500">SECTION 2</p>
              <h2 className="mt-2 text-3xl font-bold">Cloud Storage</h2>

              <div className="mt-6 space-y-4">
                {["Dropbox", "OneDrive", "Local Uploads"].map((item) => (
                  <div key={item} className="rounded-2xl bg-black/30 p-5 opacity-70">
                    <h3 className="font-semibold">{item}</h3>
                    <p className="mt-2 text-sm text-gray-400">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "driveRoot" && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-[#151515] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Google Drive</p>
                <h2 className="text-3xl font-bold">Choose Drive Section</h2>
              </div>

              <button
                onClick={() => setView("home")}
                className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 hover:bg-white/10"
              >
                Back
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <button
                onClick={() => fetchDriveFiles("root", "My Drive", "mydrive")}
                className="rounded-3xl border border-white/10 bg-black/30 p-8 text-left hover:bg-white/10"
              >
                <h3 className="text-3xl font-bold">My Drive</h3>
                <p className="mt-2 text-gray-400">
                  Normal Google Drive folders and files.
                </p>
              </button>

              <button
                onClick={() => fetchDriveFiles("root", "Computers", "computers")}
                className="rounded-3xl border border-white/10 bg-black/30 p-8 text-left hover:bg-white/10"
              >
                <h3 className="text-3xl font-bold">Computers</h3>
                <p className="mt-2 text-gray-400">
                  Laptop backup folders from Google Drive.
                </p>
              </button>
            </div>
          </div>
        )}

        {view === "files" && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-[#151515] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {selectedSource === "mydrive" ? "My Drive" : "Computers"}
                </p>
                <h2 className="text-3xl font-bold">{folderName}</h2>
              </div>

              <div className="flex gap-3">
                {currentFolderId !== "root" && (
                  <button
                    onClick={() =>
                      fetchDriveFiles(
                        "root",
                        selectedSource === "mydrive" ? "My Drive" : "Computers",
                        selectedSource
                      )
                    }
                    className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 hover:bg-white/10"
                  >
                    Back to Root
                  </button>
                )}

                <button
                  onClick={() => setView("driveRoot")}
                  className="rounded-xl border border-white/10 px-5 py-3 text-gray-300 hover:bg-white/10"
                >
                  Drive Sections
                </button>

                <button
                  onClick={() => fetchDriveFiles(currentFolderId, folderName, selectedSource)}
                  disabled={isSyncing}
                  className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-gray-200"
                >
                  {isSyncing ? "Syncing..." : "Sync"}
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
              {driveFiles.map((file) => {
                const isFolder =
                  file.mimeType === "application/vnd.google-apps.folder";

                const savedPostsForFile = scheduledPosts.filter(
                  (post) => post.drive_file_id === file.id
                );

                const postedPlatforms = savedPostsForFile.filter(
                  (post) => post.status === "posted"
                );

                const scheduledPlatforms = savedPostsForFile.filter(
                  (post) => post.status === "scheduled"
                );

                return (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]"
                  >
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                      {file.thumbnailLink ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : file.iconLink ? (
                        <img
                          src={file.iconLink}
                          alt={file.name}
                          className="h-16 w-16 object-contain opacity-80"
                        />
                      ) : (
                        <p className="text-gray-500">{isFolder ? "FOLDER" : "FILE"}</p>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="truncate text-base font-medium text-white">
                        {file.name}
                      </p>

                      {isFolder ? (
                        <button
                          onClick={() => openFolder(file)}
                          className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                        >
                          Open Folder
                        </button>
                      ) : (
                        <>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {["YouTube", "Instagram", "Pinterest", "Facebook", "Moj"].map(
                              (platform) => (
                                <button
                                  key={platform}
                                  onClick={() => openPostModal(file, platform)}
                                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
                                >
                                  {platform}
                                </button>
                              )
                            )}
                          </div>

                          <div className="mt-4 space-y-3">
                            {postedPlatforms.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-green-400">
                                  Posted
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {postedPlatforms.map((post) => (
                                    <span
                                      key={post.id}
                                      className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300"
                                    >
                                      {post.platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scheduledPlatforms.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-yellow-400">
                                  Scheduled
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {scheduledPlatforms.map((post) => (
                                    <div
                                      key={post.id}
                                      className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-300"
                                    >
                                      <span>{post.platform}</span>
                                      <button
                                        onClick={() => cancelSchedule(post.id)}
                                        className="text-red-300 hover:text-red-200"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {savedPostsForFile.length === 0 && (
                              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                                Not Posted
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {uploadTasks.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[999] flex max-h-[80vh] flex-col gap-3 overflow-y-auto">
          {uploadTasks.map((task) => (
            <div
              key={task.id}
              className="w-80 rounded-3xl border border-white/10 bg-[#111111] p-4 text-white shadow-2xl"
            >
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-black/30">
                  {task.thumbnail ? (
                    <img
                      src={task.thumbnail}
                      alt={task.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      VIDEO
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {task.fileName}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
  {task.platform} • {task.postType} •{" "}
  {task.status === "done"
    ? "Published"
    : task.status === "failed"
    ? "Failed"
    : "Uploading"}
</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        task.status === "failed" ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {task.progress}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111111] p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">Platform</p>
                <h2 className="mt-1 text-3xl font-bold">{selectedPlatform}</h2>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-gray-300"
              >
                Close
              </button>
            </div>

            <div className="mt-8 grid gap-6">
              <div>
                <p className="mb-2 text-sm text-gray-400">Selected Media</p>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  {selectedFile.name}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-400">Post Type</p>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white"
                >
                  {selectedPlatform === "YouTube" ? (
                    <>
                      <option>Video</option>
                      <option>Short</option>
                    </>
                  ) : (
                    <>
                      <option>Reel</option>
                      <option>Story</option>
                      <option>Post</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Caption</p>

                  <button
                    onClick={generateCaption}
                    disabled={isGeneratingCaption}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs text-purple-300"
                  >
                    {isGeneratingCaption ? "Generating..." : "Generate Caption"}
                  </button>
                </div>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write caption..."
                  className="h-40 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-400">Schedule Time</p>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={savePostSchedule}
                  className="rounded-2xl bg-white py-4 font-semibold text-black"
                >
                  Save Schedule
                </button>
<button
  onClick={postNow}
  className="rounded-2xl bg-green-500 py-4 font-semibold text-black"
>
  Post Now
</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}