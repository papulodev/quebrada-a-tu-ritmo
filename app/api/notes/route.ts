import { getAuth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";

const MAX_CONTENT_LENGTH = 2000;

type NoteRow = {
  id: string;
  content: string;
  created_at: Date;
};

async function currentUserId() {
  const { data: session } = await getAuth().getSession();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await currentUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await getPool().query<NoteRow>(
    "select id, content, created_at from public.notes where user_id = $1 order by created_at desc limit 50",
    [userId],
  );

  return Response.json({ notes: rows });
}

export async function POST(request: Request) {
  const userId = await currentUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return Response.json(
      { error: `content must be at most ${MAX_CONTENT_LENGTH} characters` },
      { status: 400 },
    );
  }

  const { rows } = await getPool().query<NoteRow>(
    "insert into public.notes (user_id, content) values ($1, $2) returning id, content, created_at",
    [userId, content],
  );

  return Response.json({ note: rows[0] }, { status: 201 });
}
