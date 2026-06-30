export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

        <p className="mb-6">
          Welcome to KARVIAN OS. Your privacy is important to us.
        </p>

        <h2 className="mb-3 mt-8 text-2xl font-semibold">
          Information We Collect
        </h2>

        <p className="mb-6">
          KARVIAN OS only accesses the accounts and permissions that you explicitly authorize, including Google Drive, YouTube, Facebook, and Instagram, in order to publish content on your behalf.
        </p>

        <h2 className="mb-3 mt-8 text-2xl font-semibold">
          How We Use Your Data
        </h2>

        <ul className="mb-6 list-disc pl-6">
          <li>Upload media you select.</li>
          <li>Publish content to connected platforms.</li>
          <li>Manage scheduled posts.</li>
          <li>Improve KARVIAN OS.</li>
        </ul>

        <h2 className="mb-3 mt-8 text-2xl font-semibold">Contact</h2>

        <p>karvian262@gmail.com</p>
      </div>
    </main>
  );
}