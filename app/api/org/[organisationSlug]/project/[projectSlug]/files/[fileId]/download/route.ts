import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

type RouteParams = {
  organisationSlug: string;
  projectSlug: string;
  fileId: string;
};

export async function GET(_req: NextRequest, ctx: { params: Promise<RouteParams> }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectSlug, fileId } = await ctx.params;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        project: { slug: projectSlug },
      },
      select: {
        id: true,
        name: true,
        url: true,
        blobKey: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.url?.includes(".public.blob.vercel-storage.com")) {
      return NextResponse.redirect(file.url);
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("Missing BLOB_READ_WRITE_TOKEN");
      return NextResponse.json(
        { error: "Blob token not configured" },
        { status: 500 }
      );
    }

    if (!file.blobKey) {
      console.error("Missing blobKey for file", file.id);
      return NextResponse.json(
        { error: "File not linked to blob" },
        { status: 500 }
      );
    }

    const blob = await getBlob(file.blobKey, { token });
    return NextResponse.redirect(blob.url);
  } catch (err) {
    const error = err as Error;
    console.error("[download route] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error?.message ?? String(err) },
      { status: 500 }
    );
  }
}

async function getBlob(
  blobKey: string,
  { token }: { token: string }
): Promise<{ url: string }> {
  if (!token) throw new Error("Missing token for getBlob");

  const endpoint = `https://api.vercel.com/v1/blobs/${encodeURIComponent(blobKey)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  type BlobPayload = {
    url?: string;
    data?: { url?: string };
    error?: string;
    message?: string;
    [key: string]: unknown;
  } | null;

  let payload: BlobPayload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Unexpected response fetching blob: ${res.status} ${text}`);
  }

  if (!res.ok) {
    const msg = payload?.error ?? payload?.message ?? JSON.stringify(payload);
    throw new Error(`Failed to fetch blob: ${res.status} ${msg}`);
  }

  if (payload?.url && typeof payload.url === "string") return { url: payload.url };
  if (payload?.data?.url && typeof payload.data.url === "string") return { url: payload.data.url };

  throw new Error("Blob response did not contain a url");
}
