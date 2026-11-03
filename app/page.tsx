import Link from "next/link";
import { SessionBadge } from "./session-badge";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Quebrada a tu ritmo</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Next.js on Neon: Postgres for your data, Neon Auth for sign-in.
        </p>
      </div>

      <SessionBadge />

      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" href="/notes">
          Open notes
        </Link>
        <Link className="btn btn-ghost" href="/auth/sign-in">
          Sign in
        </Link>
      </div>
    </main>
  );
}
