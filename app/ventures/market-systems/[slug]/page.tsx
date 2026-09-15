import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer, Header } from "../../../shared";
import { getPublishedProduct } from "../market-data";
import styles from "../storefront.module.css";
import { MARKETPLACE_ORIGIN, marketplaceProductUrl, marketplaceToolkitCheckoutUrl } from "../market-links";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) return { title: "Product — G$LIDE Market" };
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: marketplaceProductUrl(product.slug) },
    openGraph: { type: "website", url: marketplaceProductUrl(product.slug), title: product.name, description: product.summary, ...(product.imageUrl ? { images: [product.imageUrl] } : {}) },
    twitter: { card: "summary_large_image", title: product.name, description: product.summary, ...(product.imageUrl ? { images: [product.imageUrl] } : {}) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    url: marketplaceProductUrl(product.slug),
    ...(product.imageUrl ? { image: product.imageUrl.startsWith("http") ? product.imageUrl : `${MARKETPLACE_ORIGIN}${product.imageUrl}` } : {}),
    brand: { "@type": "Brand", name: "GOLIDE" },
    ...(product.whopUrl ? { offers: { "@type": "Offer", url: product.whopUrl, availability: "https://schema.org/InStock" } } : {}),
  };
  const toolkitCheckout = marketplaceToolkitCheckoutUrl(product.slug);

  return <main className={styles.detailPage}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productData).replace(/</g, "\\u003c") }} />
    <Header/>
    <div className={styles.detailShell}>
      <a className={styles.detailBack} href={`${MARKETPLACE_ORIGIN}/`}><ArrowLeft size={15}/> Back to marketplace</a>
      <div className={styles.detailGrid}>
        <div className={styles.detailVisual}>
          {product.imageUrl ? <img src={product.imageUrl} alt={`${product.name} product preview`}/> : <span className={styles.generatedCover}><small>{product.format}</small><strong>{product.name}</strong><em>GOLIDE</em></span>}
        </div>
        <article className={styles.detailCopy}>
          <p className={styles.eyebrow}>{product.shelf} / {product.format}</p>
          <h1>{product.name}</h1>
          <p className={styles.detailLead}>{product.summary}</p>
          {product.transformation && <div className={styles.detailTransformation}><strong>What changes</strong><br/>{product.transformation}</div>}
          <div className={styles.detailActions}>
            {product.priceText && <strong>{product.priceText}</strong>}
            {product.whopUrl ? <a className={styles.detailPrimary} href={product.whopUrl} target="_blank" rel="noreferrer">Get the system <ArrowUpRight size={17}/></a> : <span>Checkout opening soon</span>}
          </div>
          {toolkitCheckout && <aside className={styles.toolkitUpsell}>
            <div><small>INTERACTIVE UPGRADE</small><h2>Want the live workspace?</h2><p>Move from the manual system into the interactive score, map, build and tracking toolkit.</p></div>
            <a href={toolkitCheckout} target="_blank" rel="noreferrer">Get Toolkit Pro · $29.99 <ArrowUpRight size={16}/></a>
          </aside>}
        </article>
      </div>
    </div>
    <Footer/>
  </main>;
}
