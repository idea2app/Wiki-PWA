import { NextRequest, NextResponse } from "next/server";

import { lark } from "@/lib/api/Lark/core";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(request.url);

  // Check if this is a request for a cached file with extension
  const ext = url.pathname.split(".").pop();
  if (ext && ext !== id) {
    // Redirect to cache host if configured
    const cacheHost = process.env.NEXT_PUBLIC_CACHE_HOST;
    if (cacheHost) {
      return NextResponse.redirect(new URL(url.pathname, cacheHost));
    }
  }

  try {
    const token = await lark.getAccessToken();

    const response = await fetch(
      `${lark.client.baseURI}drive/v1/medias/${id}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition = response.headers.get("Content-Disposition");
    const contentLength = response.headers.get("Content-Length");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (contentDisposition)
      headers.set("Content-Disposition", contentDisposition);
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading file:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const token = await lark.getAccessToken();

    const response = await fetch(
      `${lark.client.baseURI}drive/v1/medias/${id}/download`,
      {
        method: "HEAD",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition = response.headers.get("Content-Disposition");
    const contentLength = response.headers.get("Content-Length");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (contentDisposition)
      headers.set("Content-Disposition", contentDisposition);
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error checking file:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
