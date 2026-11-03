"use client";

import { createAuthClient } from "@neondatabase/auth/next";
import { useRouter } from "next/navigation";
import { useState } from "react";

const authClient = createAuthClient();

export function NotesForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not save the note.");
      return;
    }

    setContent("");
    router.refresh();
  }

  async function onSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          className="input input-bordered w-full"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a note"
          maxLength={2000}
          aria-label="Note content"
        />
        <button className="btn btn-primary" type="submit" disabled={pending || !content.trim()}>
          {pending ? "Saving…" : "Add note"}
        </button>
      </form>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <button className="btn btn-ghost btn-sm self-start" type="button" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}
