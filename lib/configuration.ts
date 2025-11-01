export const isServer = () => typeof window === "undefined";

export const { VERCEL, VERCEL_URL } = process.env;

export const Own_API_Host = isServer()
  ? VERCEL_URL
    ? `https://${VERCEL_URL}`
    : "http://localhost:3000"
  : globalThis.location.origin;

export const CACHE_HOST = process.env.NEXT_PUBLIC_CACHE_HOST;

export const LARK_API_HOST = `${Own_API_Host}/api/Lark/`;

export const LarkAppMeta = {
  id: process.env.LARK_APP_ID || "",
  secret: process.env.LARK_APP_SECRET || "",
};
const { hostname, pathname } = new URL(process.env.NEXT_PUBLIC_LARK_WIKI_URL!);

export const LarkWikiDomain = hostname;
export const LarkWikiId = pathname.split("/").pop()!;
