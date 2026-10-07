/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// First path segments on marketplace.golidee.com that are NOT product slugs:
// app routes, public/ asset folders and paths handled elsewhere in this worker.
// Add a new top-level app route or public folder here, or the marketplace will
// treat it as a product slug.
const marketplaceReservedSegments = new Set([
  "jobsearch", "partners", "manage", "shared", "studio", "content-engine", "ventures",
  "api", "auth", "login", "admin-only", "founder", "portfolio", "privacy", "projects", "research", "terms",
  "audio", "brand", "experience", "fonts", "marketplace", "marketplace-assets", "videos",
]);

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    const marketplaceHost = hostname === "marketplace.golidee.com";
    const legacyMarketPath = "/ventures/market-systems";
    const jobSearchSlug = "job-search-conversion-system-62224";

    // Migration safety: any stale GOLIDE link that still points at the old
    // ChatGPT-hosted auth route is redirected into the first-party login page.
    if (url.pathname === "/signin-with-chatgpt") {
      const returnTo = url.searchParams.get("return_to") || "/";
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/");
      return Response.redirect(loginUrl, 307);
    }

    if (!marketplaceHost && ["/studio", "/studio/", "/content-engine", "/content-engine/"].includes(url.pathname)) {
      return Response.redirect("https://studio.golidee.com/", 308);
    }

    if (!marketplaceHost && (url.pathname === "/manage/partners" || url.pathname === "/manage/partners/")) {
      return Response.redirect("https://marketplace.golidee.com/partners", 308);
    }

    if (!marketplaceHost && url.pathname.startsWith(legacyMarketPath) && !url.pathname.startsWith(`${legacyMarketPath}/manage`)) {
      const suffix = url.pathname.slice(legacyMarketPath.length).replace(/^\/+|\/+$/g, "");
      // Redirect straight to the canonical URL (no trailing slash) so crawlers get one hop, not a chain.
      const destination = suffix === jobSearchSlug ? "/jobsearch" : suffix ? `/${suffix}` : "/";
      return Response.redirect(`https://marketplace.golidee.com${destination}`, 308);
    }

    if (marketplaceHost) {
      if (url.pathname.startsWith(legacyMarketPath)) {
        const suffix = url.pathname.slice(legacyMarketPath.length).replace(/^\/+|\/+$/g, "");
        const destination = suffix === "manage" ? `/manage${url.search}` : suffix === jobSearchSlug ? "/jobsearch" : suffix ? `/${suffix}` : "/";
        return Response.redirect(`https://marketplace.golidee.com${destination}`, 308);
      }

      // One URL per page: the trailing-slash variants used to serve the same page with a 200,
      // which Search Console reports as "Alternate page with proper canonical tag".
      if (url.pathname === "/jobsearch/" || url.pathname === "/partners/") {
        return Response.redirect(`https://marketplace.golidee.com${url.pathname.slice(0, -1)}${url.search}`, 308);
      }

      // Every product lives at marketplace.golidee.com/<slug> (its canonical URL, see
      // market-links.ts). A single lowercase slug segment that isn't an app route or a
      // public asset folder is served by the product page; unknown slugs 404 there.
      const productSlug = url.pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)(\/?)$/);
      if (productSlug && !marketplaceReservedSegments.has(productSlug[1])) {
        if (productSlug[2]) return Response.redirect(`https://marketplace.golidee.com/${productSlug[1]}${url.search}`, 308);
        url.pathname = `${legacyMarketPath}/${productSlug[1]}`;
        request = new Request(url, request);
        return handler.fetch(request, env, ctx);
      }

      if (url.pathname === "/jobsearch/jobsearch-toolkit" || url.pathname === "/jobsearch/jobsearch-toolkit/") {
        const assetResponse = await env.ASSETS.fetch(new Request(new URL("/marketplace/jobsearch/jobsearch-toolkit/", request.url), request));
        if (!assetResponse.ok) return assetResponse;
        const html = (await assetResponse.text()).replaceAll("/signin-with-chatgpt?return_to=", "/login?returnTo=");
        const headers = new Headers(assetResponse.headers);
        headers.set("content-type", "text/html; charset=utf-8");
        headers.set("cache-control", "no-cache");
        headers.delete("content-length");
        return new Response(html, { status: assetResponse.status, statusText: assetResponse.statusText, headers });
      }

      const marketplaceAssets: Record<string, string> = {
        "/shared/tokens.css": "/marketplace-assets/tokens.css",
        "/shared/theme.js": "/marketplace-assets/theme.js",
        "/golide-logo.png": "/marketplace-assets/golide-logo.png",
      };
      const assetPath = marketplaceAssets[url.pathname];
      if (assetPath) return env.ASSETS.fetch(new Request(new URL(assetPath, request.url), request));

      if (url.pathname === "/partners" || url.pathname === "/partners/") url.pathname = `${legacyMarketPath}/partners`;
      else if (url.pathname === "/manage" || url.pathname === "/manage/") url.pathname = `${legacyMarketPath}/manage`;
      else if (url.pathname === "/" || url.pathname === "") url.pathname = legacyMarketPath;
      else if (url.pathname === "/jobsearch" || url.pathname === "/jobsearch/") url.pathname = `${legacyMarketPath}/${jobSearchSlug}`;
      request = new Request(url, request);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
