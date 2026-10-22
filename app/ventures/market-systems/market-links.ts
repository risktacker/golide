export const MARKETPLACE_ORIGIN = "https://marketplace.golidee.com";
export const JOB_SEARCH_PRODUCT_SLUG = "job-search-conversion-system-62224";
export const JOB_SEARCH_TOOLKIT_CHECKOUT_URL = "https://whop.com/easy-with-golide/products/job-search-toolkit-pro/";

export function marketplaceProductPath(slug: string): string {
  return slug === JOB_SEARCH_PRODUCT_SLUG ? "/jobsearch" : `/${slug}`;
}

export function marketplaceProductUrl(slug: string): string {
  return `${MARKETPLACE_ORIGIN}${marketplaceProductPath(slug)}`;
}

// Amazon storefronts (amazon.com, amazon.co.uk, amazon.de, ...) plus Amazon's short links.
const AMAZON_HOST = /(^|\.)amazon\.(com|ca|co\.uk|de|fr|es|it|nl|se|pl|com\.au|co\.jp|in|com\.mx|com\.br|com\.be|ie)$|^(amzn\.to|a\.co)$/i;

export function isAmazonUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && AMAZON_HOST.test(url.hostname);
  } catch { return false; }
}

type PurchaseFields = { whopUrl?: string | null; amazonUrl?: string | null; priceText?: string | null; bookPriceText?: string | null };
export type PurchaseLink = { href: string; label: string };

/** Primary buy button: the Whop product when there is one, otherwise the Amazon book. */
export function primaryPurchase(product: PurchaseFields): PurchaseLink | null {
  if (product.whopUrl) return { href: product.whopUrl, label: "Get access" };
  if (product.amazonUrl) return { href: product.amazonUrl, label: "Buy on Amazon" };
  return null;
}

/** Book offer shown alongside a Whop product, e.g. the paperback/Kindle edition of a system. */
export function bookUpsell(product: PurchaseFields): (PurchaseLink & { price: string }) | null {
  if (!product.whopUrl || !product.amazonUrl) return null;
  return { href: product.amazonUrl, label: "Buy on Amazon", price: product.bookPriceText || "" };
}

export function marketplaceToolkitCheckoutUrl(slug: string): string | null {
  return slug === JOB_SEARCH_PRODUCT_SLUG ? JOB_SEARCH_TOOLKIT_CHECKOUT_URL : null;
}
