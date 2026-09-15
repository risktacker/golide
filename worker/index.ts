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

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    const marketplaceHost = hostname === "marketplace.golidee.com";
    const legacyMarketPath = "/ventures/market-systems";
    const jobSearchSlug = "job-search-conversion-system-62224";

    if (!marketplaceHost && url.pathname.startsWith(legacyMarketPath) && !url.pathname.startsWith(`${legacyMarketPath}/manage`)) {
      const suffix = url.pathname.slice(legacyMarketPath.length).replace(/^\/+|\/+$/g, "");
      const destination = suffix === jobSearchSlug ? "/jobsearch/" : suffix ? `/${suffix}/` : "/";
      return Response.redirect(`https://marketplace.golidee.com${destination}`, 308);
    }

    if (marketplaceHost) {
      if (url.pathname.startsWith(legacyMarketPath)) {
        const suffix = url.pathname.slice(legacyMarketPath.length).replace(/^\/+|\/+$/g, "");
        const destination = suffix === "manage" ? `/manage${url.search}` : suffix === jobSearchSlug ? "/jobsearch/" : suffix ? `/${suffix}/` : "/";
        return Response.redirect(`https://marketplace.golidee.com${destination}`, 308);
      }

      if (url.pathname === "/jobsearch/jobsearch-toolkit" || url.pathname === "/jobsearch/jobsearch-toolkit/") {
        return env.ASSETS.fetch(new Request(new URL("/marketplace/jobsearch/jobsearch-toolkit/", request.url), request));
      }

      const marketplaceAssets: Record<string, string> = {
        "/shared/tokens.css": "/marketplace-assets/tokens.css",
        "/shared/theme.js": "/marketplace-assets/theme.js",
        "/golide-logo.png": "/marketplace-assets/golide-logo.png",
      };
      const assetPath = marketplaceAssets[url.pathname];
      if (assetPath) return env.ASSETS.fetch(new Request(new URL(assetPath, request.url), request));

      if (url.pathname === "/manage" || url.pathname === "/manage/") url.pathname = `${legacyMarketPath}/manage`;
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
