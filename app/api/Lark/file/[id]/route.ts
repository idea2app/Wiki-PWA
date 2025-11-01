import { fileTypeFromStream } from "file-type";
import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";

import { lark } from "@/lib/api/Lark/core";
import { CACHE_HOST } from "@/lib/configuration";

async function handleFileRequest(
  id: string,
  method: "GET" | "HEAD" = "GET",
  request?: NextRequest,
) {
  const isGet = method === "GET";

  // Check if this is a request for a cached file with extension (GET only)
  if (isGet && request) {
    const { pathname } = new URL(request.url);
    const ext = extname(pathname);

    if (ext && CACHE_HOST)
      return NextResponse.redirect(new URL(pathname, CACHE_HOST));
  }
  const token = await lark.getAccessToken();

  const response = await fetch(
    `${lark.client.baseURI}drive/v1/medias/${id}/download`,
    { method, headers: { Authorization: `Bearer ${token}` } },
  );
  const { ok, status, headers, body } = response;

  if (!ok) return NextResponse.json(await response.json(), { status });

  const mime = headers.get("Content-Type"),
    [stream1, stream2] = body!.tee();

  const contentType = mime?.startsWith("application/octet-stream")
    ? (await fileTypeFromStream(stream1))?.mime
    : mime;
  const header = new Headers();
  header.set("Content-Type", contentType || "application/octet-stream");
  header.set("Content-Disposition", headers.get("Content-Disposition") || "");
  header.set("Content-Length", headers.get("Content-Length") || "");

  return new NextResponse(isGet ? stream2 : null, {
    status: isGet ? 200 : 204,
    headers: header,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return handleFileRequest(id, "GET", request);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return handleFileRequest(id, "HEAD");
}
