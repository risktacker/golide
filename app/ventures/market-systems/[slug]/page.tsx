import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer, Header } from "../../../shared";
import { getPublishedProduct } from "../market-data";
import styles from "../market.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) return { title: "Product — G$LIDE Market" };
  return {
    title: `${product.name} — G$LIDE Market`,
    description: product.summary,
    openGraph: product.imageUrl ? { images: [product.imageUrl] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  return <main className={styles.detailPage}>
    <Header/>
    <div className={styles.detailShell}>
      <Link className={styles.detailBack} href="/ventures/market-systems"><ArrowLeft size={15}/> Back to digital market</Link>
      <div className={styles.detailGrid}>
        <div className={styles.detailVisual}>
          {product.imageUrl ? <img src={product.imageUrl} alt={`${product.name} product preview`}/> : <span className={styles.generatedCover}><small>{product.format}</small><strong>{product.name}</strong><em>G$LIDE</em></span>}
        </div>
        <article className={styles.detailCopy}>
          <p className={styles.eyebrow}>{product.shelf} / {product.format}</p>
          <h1>{product.name}</h1>
          <p className={styles.lead}>{product.summary}</p>
          {product.transformation && <div className={styles.detailTransformation}><strong>Transformation</strong><br/>{product.transformation}</div>}
          <div className={styles.detailActions}>
            {product.priceText && <strong>{product.priceText}</strong>}
            {product.whopUrl ? <a href={product.whopUrl} target="_blank" rel="noreferrer">Get the system <ArrowUpRight size={17}/></a> : <span>Checkout opening soon</span>}
          </div>
        </article>
      </div>
    </div>
    <Footer/>
  </main>;
}
