"use client";

import { createAuthClient } from "@neondatabase/auth/next";
import { useRouter } from "next/navigation";
import { useState } from "react";

const authClient = createAuthClient();

type Mode = "sign-in" | "sign-up";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Authentication failed.");
      return;
    }

    router.push("/notes");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Sessions are managed by Neon Auth and stored in Postgres.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {mode === "sign-up" ? (
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              className="input input-bordered w-full"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            className="input input-bordered w-full"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            className="input input-bordered w-full"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        className="btn btn-ghost btn-sm self-start"
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
        }}
      >
        {mode === "sign-in" ? "Need an account? Sign up" : "Already registered? Sign in"}
      </button>
    </main>
  );
}
