export const MARKETPLACE_ORIGIN = "https://marketplace.golidee.com";
export const JOB_SEARCH_PRODUCT_SLUG = "job-search-conversion-system-62224";
export const JOB_SEARCH_TOOLKIT_CHECKOUT_URL = "https://whop.com/easy-with-golide/products/job-search-toolkit-pro/";

export function marketplaceProductPath(slug: string): string {
  return slug === JOB_SEARCH_PRODUCT_SLUG ? "/jobsearch" : `/${slug}`;
}

export function marketplaceProductUrl(slug: string): string {
  return `${MARKETPLACE_ORIGIN}${marketplaceProductPath(slug)}`;
}

export function marketplaceToolkitCheckoutUrl(slug: string): string | null {
  return slug === JOB_SEARCH_PRODUCT_SLUG ? JOB_SEARCH_TOOLKIT_CHECKOUT_URL : null;
}
