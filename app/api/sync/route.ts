import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SYNC_KEY_PEPPER = process.env.CONTENT_UNIVERSE_SYNC_PEPPER || "content-universe-v21";

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function headers() {
  return {
    apikey: SUPABASE_KEY as string,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

function normalizeSyncKey(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function workspaceId(syncKey: string) {
  return `personal-${createHash("sha256").update(`${SYNC_KEY_PEPPER}:${syncKey}`).digest("hex")}`;
}

function validateSyncKey(syncKey: string) {
  if (syncKey.length < 8) return "Mã đồng bộ phải có ít nhất 8 ký tự.";
  if (syncKey.length > 128) return "Mã đồng bộ quá dài.";
  return "";
}

export async function GET(request: Request) {
  if (!configured()) {
    return NextResponse.json({ configured: false, payload: null });
  }

  const syncKey = normalizeSyncKey(new URL(request.url).searchParams.get("syncKey"));
  const validationError = validateSyncKey(syncKey);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const id = workspaceId(syncKey);
  const url = `${SUPABASE_URL}/rest/v1/content_universe_workspaces?id=eq.${encodeURIComponent(id)}&select=payload,updated_at&limit=1`;
  const response = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: 502 });
  }

  const rows = await response.json();
  const row = rows?.[0];
  return NextResponse.json({
    configured: true,
    found: Boolean(row),
    payload: row?.payload || null,
    updatedAt: row?.updated_at || null,
  });
}

export async function PUT(request: Request) {
  if (!configured()) {
    return NextResponse.json({ configured: false, savedLocally: true }, { status: 503 });
  }

  const body = await request.json();
  const syncKey = normalizeSyncKey(body?.syncKey);
  const validationError = validateSyncKey(syncKey);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }
  if (!body || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return NextResponse.json({ error: "Payload không hợp lệ." }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const id = workspaceId(syncKey);
  const url = `${SUPABASE_URL}/rest/v1/content_universe_workspaces?on_conflict=id`;
  const response = await fetch(url, {
    method: "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ id, payload: body.payload, updated_at: updatedAt }]),
  });
  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: 502 });
  }
  return NextResponse.json({ ok: true, updatedAt });
}
