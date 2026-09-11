"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import type { MarketProduct } from "../market-data";
import styles from "../market.module.css";

const shelves = ["Career", "Creator", "Business", "Productivity", "Learning"];

export default function ManagerClient() {
  const searchParams = useSearchParams();
  const requestedShelf = searchParams.get("shelf") || "Career";
  const initialShelf = shelves.includes(requestedShelf) ? requestedShelf : "Career";

  const [passcode, setPasscode] = useState("");
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shelf, setShelf] = useState(initialShelf);

  async function api(payload: Record<string, unknown>) {
    const response = await fetch("/api/market-products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, passcode }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Publisher request failed.");
    return data;
  }

  async function loadProducts() {
    setLoading(true); setMessage("");
    try {
      const data = await api({ action: "list" });
      setProducts(data.products || []);
      setMessage("Publisher unlocked.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not unlock publisher.");
    } finally { setLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      const data = await api({
        action: "create",
        product: {
          name: form.get("name"),
          shelf,
          format: form.get("format"),
          priceText: form.get("priceText"),
          summary: form.get("summary"),
          transformation: form.get("transformation"),
          imageUrl: form.get("imageUrl"),
          whopUrl: form.get("whopUrl"),
          featured: form.get("featured") === "on",
          published: form.get("published") === "on",
          sortOrder: form.get("sortOrder"),
        },
      });
      event.currentTarget.reset();
      setShelf(initialShelf);
      setMessage(data.published ? `Published: ${data.slug}` : `Saved as draft: ${data.slug}`);
      const refreshed = await api({ action: "list" });
      setProducts(refreshed.products || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally { setLoading(false); }
  }

  async function toggle(product: MarketProduct) {
    setLoading(true); setMessage("");
    try {
      await api({ action: "toggle", id: product.id, published: !product.published });
      const refreshed = await api({ action: "list" });
      setProducts(refreshed.products || []);
      setMessage(product.published ? "Product moved to draft." : "Product published to the shelf.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update product.");
    } finally { setLoading(false); }
  }

  async function remove(product: MarketProduct) {
    if (!confirm(`Delete ${product.name}?`)) return;
    setLoading(true); setMessage("");
    try {
      await api({ action: "delete", id: product.id });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete product.");
    } finally { setLoading(false); }
  }

  return <main className={styles.managerPage}>
    <div className={styles.managerShell}>
      <Link className={styles.detailBack} href="/ventures/market-systems?publisher=1"><ArrowLeft size={15}/> Back to market</Link>
      <div className={styles.managerHead}>
        <div><p className={styles.eyebrow}>G$LIDE MARKET PUBLISHER</p><h1>Add once.<br/>Place it on the shelf.</h1></div>
        <p>Use this publisher for every new digital product. Add the Whop purchase link, optional merchandising image, choose the shelf, then publish. The public marketplace and product page update from the same catalog.</p>
      </div>

      <div className={styles.managerForm} style={{marginBottom:16}}>
        <label className={styles.full}>Publisher passcode<input type="password" value={passcode} onChange={(e)=>setPasscode(e.target.value)} placeholder="Enter publisher passcode" autoComplete="current-password"/></label>
        <div className={styles.publishRow}><button type="button" onClick={loadProducts} disabled={loading}>{loading ? "Working…" : "Unlock / refresh catalog"} <RefreshCw size={14}/></button></div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <form className={styles.managerForm} onSubmit={submit}>
        <label>Product name<input name="name" required placeholder="Job Search Conversion System"/></label>
        <label>Shelf<select name="shelf" value={shelf} onChange={(event)=>setShelf(event.target.value)}>{shelves.map((shelfName)=><option key={shelfName}>{shelfName}</option>)}</select></label>
        <label>Format<input name="format" placeholder="Toolkit" defaultValue="Toolkit"/></label>
        <label>Price display<input name="priceText" placeholder="$29"/></label>
        <label className={styles.full}>Short promise / summary<textarea name="summary" required placeholder="What the buyer gets and the problem it solves."/></label>
        <label className={styles.full}>Transformation<textarea name="transformation" placeholder="From scattered applications to a repeatable job-search system."/></label>
        <label>Whop purchase URL<input name="whopUrl" type="url" placeholder="https://whop.com/..."/></label>
        <label>Merchandising image URL<input name="imageUrl" placeholder="https://... or /market/..."/></label>
        <label>Sort order<input name="sortOrder" type="number" defaultValue="0"/></label>
        <div className={styles.publishRow}>
          <label><input name="featured" type="checkbox"/> Featured</label>
          <label><input name="published" type="checkbox"/> Publish immediately</label>
          <button type="submit" disabled={loading}>Save product</button>
        </div>
      </form>
      <p className={styles.managerNote}>If no product image is supplied, GOLIDE automatically renders a branded digital-product object so the shelf never breaks.</p>

      {products.length > 0 && <div className={styles.productTable}>
        {products.map((product)=><div className={styles.productRow} key={product.id}>
          <div><strong>{product.name}</strong><br/><small>/{product.slug}</small></div>
          <span>{product.shelf}</span><span>{product.format}</span>
          <span className={product.published ? styles.statusLive : styles.statusDraft}>{product.published ? "LIVE" : "DRAFT"}</span>
          <div className={styles.rowActions}>
            {product.published && <Link href={`/ventures/market-systems/${product.slug}`} target="_blank" aria-label="Open product"><ExternalLink size={14}/></Link>}
            <button type="button" onClick={()=>toggle(product)}>{product.published ? "Unpublish" : "Publish"}</button>
            <button className={styles.danger} type="button" onClick={()=>remove(product)}><Trash2 size={12}/></button>
          </div>
        </div>)}
      </div>}
    </div>
  </main>;
}
