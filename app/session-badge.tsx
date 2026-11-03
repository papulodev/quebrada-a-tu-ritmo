"use client";

import { createAuthClient } from "@neondatabase/auth/next";
import Link from "next/link";

const authClient = createAuthClient();

export function SessionBadge() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p className="text-sm text-zinc-500">Checking session…</p>;
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Not signed in.{" "}
        <Link className="font-medium underline" href="/auth/sign-in">
          Sign in
        </Link>{" "}
        to create notes.
      </p>
    );
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Signed in as <span className="font-medium">{session.user.email}</span>.{" "}
      <Link className="font-medium underline" href="/notes">
        Open your notes
      </Link>
      .
    </p>
  );
}
