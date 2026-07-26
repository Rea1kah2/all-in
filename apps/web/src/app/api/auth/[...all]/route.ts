import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

function unavailable(error: unknown) {
  console.error("Auth belum siap dipakai", error);
  return NextResponse.json(
    { message: "Layanan akun belum dikonfigurasi", code: "auth_unavailable" },
    { status: 503 },
  );
}

let handler: ReturnType<typeof toNextJsHandler> | null = null;

function resolveHandler() {
  if (!handler) {
    handler = toNextJsHandler(getAuth());
  }
  return handler;
}

export async function GET(request: Request) {
  try {
    return await resolveHandler().GET(request);
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  try {
    return await resolveHandler().POST(request);
  } catch (error) {
    return unavailable(error);
  }
}
