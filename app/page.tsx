import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-8 py-6">
        <h1 className="text-xl font-bold tracking-[0.15em]">KARVIAN OS</h1>

        <Link
          href="/login"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-gray-200"
        >
          Login
        </Link>
      </nav>

      <section className="flex min-h-[80vh] items-center justify-center px-8 text-center">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-gray-500">
            Creator Operating System
          </p>

          <h2 className="mt-6 text-6xl font-bold leading-tight">
            Upload Once.
            <br />
            Publish Everywhere.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Karvian OS helps creators, brands, and agencies sync content,
            generate captions, schedule posts, and manage publishing across
            every platform from one dashboard.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black hover:bg-gray-200"
            >
              Get Started
            </Link>

            <Link
              href="/platforms"
              className="rounded-2xl border border-white/10 px-8 py-4 font-semibold text-gray-300 hover:bg-white/10"
            >
              View Platforms
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}