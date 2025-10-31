export const isServer = () => typeof window === "undefined";

export const { VERCEL, VERCEL_URL } = process.env;

export const Own_API_Host = isServer()
  ? VERCEL_URL
    ? `https://${VERCEL_URL}`
    : "http://localhost:3000"
  : globalThis.location.origin;

export const LARK_API_HOST = `${Own_API_Host}/api/Lark/`;

export const LarkAppMeta = {
  id: process.env.LARK_APP_ID || "",
  secret: process.env.LARK_APP_SECRET || "",
};

const larkWikiUrl = process.env.NEXT_PUBLIC_LARK_WIKI_URL || "";

let domain = "";
let id = "";

if (larkWikiUrl) {
  try {
    const { hostname, pathname } = new URL(larkWikiUrl);
    domain = hostname;
    id = pathname.split("/").pop() || "";
  } catch (e) {
    console.error("Invalid LARK_WIKI_URL:", e);
  }
}

export const LarkWikiDomain = domain;
export const LarkWikiId = id;
