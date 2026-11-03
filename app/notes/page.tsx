import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { NotesForm } from "./notes-form";

type NoteRow = {
  id: string;
  content: string;
  created_at: Date;
};

async function NotesBoard() {
  // Stop prerendering here: session and notes are request-time data.
  await connection();
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return <p className="text-sm">You are not signed in. Go to /auth/sign-in to continue.</p>;
  }

  const { rows } = await pool.query<NoteRow>(
    "select id, content, created_at from public.notes where user_id = $1 order by created_at desc limit 50",
    [session.user.id],
  );

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as <span className="font-medium">{session.user.email}</span>
      </p>

      <NotesForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your notes</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No notes yet. Add the first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((note) => (
              <li key={note.id} className="rounded-lg border border-black/10 px-4 py-3 dark:border-white/15">
                <p className="whitespace-pre-wrap break-words">{note.content}</p>
                <time
                  className="text-xs text-zinc-500"
                  dateTime={new Date(note.created_at).toISOString()}
                >
                  {new Date(note.created_at).toLocaleString("en-US")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function NotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Rows live in Neon Postgres and are scoped to your Neon Auth user.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-zinc-500">Loading your notes…</p>}>
        <NotesBoard />
      </Suspense>
    </main>
  );
}
