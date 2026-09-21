"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { MarketProduct } from "../market-data";
import { marketplaceProductPath } from "../market-links";
import styles from "../storefront.module.css";

const shelves = ["Career", "Creator", "Business", "Productivity", "Learning"];
const MAX_IMAGE_BYTES = 2_000_000;
type Mode = "catalog" | "add" | "edit";

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return reject(new Error("Use a PNG, JPG or WEBP image."));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error("Image is too large. Keep it under 2 MB."));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

export default function ManagerClient() {
  const searchParams = useSearchParams();
  const requestedEdit = searchParams.get("edit") || "";
  const requestedMode = searchParams.get("mode");
  const requestedShelf = searchParams.get("shelf") || "Career";
  const initialShelf = shelves.includes(requestedShelf) ? requestedShelf : "Career";
  const mode: Mode = requestedEdit ? "edit" : requestedMode === "add" ? "add" : "catalog";

  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [shelf, setShelf] = useState(initialShelf);
  const [editShelf, setEditShelf] = useState("Career");
  const [createImageData, setCreateImageData] = useState("");
  const [editImageData, setEditImageData] = useState("");

  const editing = useMemo(() => requestedEdit ? products.find((product) => product.id === requestedEdit || product.slug === requestedEdit) ?? null : null, [products, requestedEdit]);
  useEffect(() => { if (editing) setEditShelf(editing.shelf); }, [editing]);

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/market-products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Publisher request failed.");
    return data;
  }, []);

  const loadProducts = useCallback(async (successMessage?: string) => {
    setLoading(true);
    try {
      const data = await api({ action: "list" });
      setProducts(data.products || []);
      if (successMessage) setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the catalog.");
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  async function chooseCreateImage(file?: File) {
    if (!file) return;
    try { setCreateImageData(await readImage(file)); setMessage("Image ready to upload."); }
    catch (error) { setCreateImageData(""); setMessage(error instanceof Error ? error.message : "Could not use that image."); }
  }

  async function chooseEditImage(file?: File) {
    if (!file) return;
    try { setEditImageData(await readImage(file)); setMessage("Replacement image ready."); }
    catch (error) { setEditImageData(""); setMessage(error instanceof Error ? error.message : "Could not use that image."); }
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      await api({ action: "create", product: {
        name: form.get("name"), shelf, format: form.get("format"), priceText: form.get("priceText"), summary: form.get("summary"), transformation: form.get("transformation"), imageUrl: createImageData || form.get("imageUrl"), whopUrl: form.get("whopUrl"), featured: form.get("featured") === "on", published: form.get("published") === "on", sortOrder: form.get("sortOrder"),
        lifecycleStatus: form.get("lifecycleStatus"), targetAudience: form.get("targetAudience"), problemSolved: form.get("problemSolved"), keywords: form.get("keywords"), creatorNiches: form.get("creatorNiches"), targetGeographies: form.get("targetGeographies"), affiliateRate: form.get("affiliateRate"), launchDate: form.get("launchDate"), priority: form.get("priority"),
      }});
      window.location.href = "/manage";
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save product."); setLoading(false); }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      await api({ action: "update", id: editing.id, product: {
        name: form.get("name"), shelf: editShelf, format: form.get("format"), priceText: form.get("priceText"), summary: form.get("summary"), transformation: form.get("transformation"), imageUrl: editImageData || form.get("imageUrl"), whopUrl: form.get("whopUrl"), featured: form.get("featured") === "on", published: form.get("published") === "on", sortOrder: form.get("sortOrder"),
        lifecycleStatus: form.get("lifecycleStatus"), targetAudience: form.get("targetAudience"), problemSolved: form.get("problemSolved"), keywords: form.get("keywords"), creatorNiches: form.get("creatorNiches"), targetGeographies: form.get("targetGeographies"), affiliateRate: form.get("affiliateRate"), launchDate: form.get("launchDate"), priority: form.get("priority"),
      }});
      window.location.href = "/manage";
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update product."); setLoading(false); }
  }

  async function toggle(product: MarketProduct) {
    setLoading(true); setMessage("");
    try { await api({ action: "toggle", id: product.id, published: !product.published }); await loadProducts(product.published ? "Moved to draft." : "Published."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update product."); setLoading(false); }
  }

  async function remove(product: MarketProduct) {
    if (!confirm(`Delete ${product.name}?`)) return;
    setLoading(true); setMessage("");
    try { await api({ action: "delete", id: product.id }); await loadProducts("Product deleted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete product."); setLoading(false); }
  }

  const formFields = (isEdit: boolean) => {
    const product = isEdit ? editing : null;
    return <>
      <label>Product name<input name="name" required defaultValue={product?.name || ""} placeholder="Job Search Conversion System"/></label>
      <label>Shelf<select name="shelf" value={isEdit ? editShelf : shelf} onChange={(event) => isEdit ? setEditShelf(event.target.value) : setShelf(event.target.value)}>{shelves.map((name) => <option key={name}>{name}</option>)}</select></label>
      <label>Format<input name="format" defaultValue={product?.format || "Toolkit"}/></label>
      <label>Price display<input name="priceText" defaultValue={product?.priceText || ""} placeholder="$19.99"/></label>
      <label className={styles.managerFull}>Short promise / summary<textarea name="summary" required defaultValue={product?.summary || ""} placeholder="What the buyer gets and the problem it solves."/></label>
      <label className={styles.managerFull}>Transformation<textarea name="transformation" defaultValue={product?.transformation || ""} placeholder="What changes for the buyer after using it."/></label>
      <label>Lifecycle
        <select name="lifecycleStatus" defaultValue={product?.lifecycleStatus || (product?.published ? "ACTIVE" : "PRE_LAUNCH")}>
          <option value="IDEA">Idea</option><option value="PRE_LAUNCH">Pre-launch</option><option value="NEW">New</option><option value="ACTIVE">Active</option><option value="MATURE">Mature</option><option value="PAUSED">Paused</option>
        </select>
      </label>
      <label>Launch date<input name="launchDate" type="date" defaultValue={product?.launchDate || ""}/></label>
      <label className={styles.managerFull}>Target audience<textarea name="targetAudience" defaultValue={product?.targetAudience || ""} placeholder="Who this is built for, buying context and audience traits."/></label>
      <label className={styles.managerFull}>Problem solved<textarea name="problemSolved" defaultValue={product?.problemSolved || ""} placeholder="The concrete problem this product solves."/></label>
      <label>Creator niches<input name="creatorNiches" defaultValue={product?.creatorNiches || ""} placeholder="career coach, HR creator, remote work"/></label>
      <label>Target geographies<input name="targetGeographies" defaultValue={product?.targetGeographies || ""} placeholder="US, UK, Canada, India"/></label>
      <label className={styles.managerFull}>Discovery keywords<input name="keywords" defaultValue={product?.keywords || ""} placeholder="Comma-separated search and content-fit terms"/></label>
      <label>Affiliate rate %<input name="affiliateRate" type="number" min="0" max="100" defaultValue={product?.affiliateRate ?? 0}/></label>
      <label>Distribution priority<input name="priority" type="number" min="0" max="100" defaultValue={product?.priority ?? 50}/></label>
      <label>Whop purchase URL<input name="whopUrl" type="url" defaultValue={product?.whopUrl || ""} placeholder="https://whop.com/..."/></label>
      <label>{isEdit ? "Upload replacement image" : "Upload product image"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => isEdit ? chooseEditImage(event.currentTarget.files?.[0]) : chooseCreateImage(event.currentTarget.files?.[0])}/></label>
      <label>Or image path / URL<input name="imageUrl" defaultValue={isEdit && product?.imageUrl && !product.imageUrl.startsWith("data:image/") ? product.imageUrl : ""} placeholder="Optional: /market/... or https://..."/></label>
      {((isEdit ? editImageData : createImageData) || (isEdit && product?.imageUrl)) && <div className={styles.managerPreview}><img src={(isEdit ? editImageData : createImageData) || product?.imageUrl || ""} alt="Product preview"/><span>{isEdit && !editImageData ? "Current product image" : "Image ready"} <Upload size={14}/></span></div>}
      <label>Sort order<input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0}/></label>
      <div className={styles.managerChecks}><label><input name="featured" type="checkbox" defaultChecked={Boolean(product?.featured)}/> Featured</label><label><input name="published" type="checkbox" defaultChecked={Boolean(product?.published)}/> Published</label></div>
    </>;
  };

  return <main className={styles.managerPage}><div className={styles.managerShell}>
    <a className={styles.detailBack} href="https://marketplace.golidee.com/"><ArrowLeft size={15}/> Back to marketplace</a>
    <header className={styles.managerHeader}>
      <div><p className={styles.eyebrow}>GOLIDE MARKET PUBLISHER</p><h1>{mode === "add" ? "Add a product." : mode === "edit" ? "Edit product." : "Product catalog."}</h1><p>{mode === "catalog" ? "Manage what is live without opening an empty form first." : "The publisher now mirrors the marketplace and stays focused on one task at a time."}</p></div>
      <div className={styles.managerHeaderActions}>
        {mode !== "catalog" && <a href="/manage"><X size={15}/> Cancel</a>}
        {mode === "catalog" && <><button type="button" onClick={() => void loadProducts("Catalog refreshed.")} disabled={loading}><RefreshCw size={15}/> Refresh</button><a className={styles.managerAdd} href="/manage?mode=add"><Plus size={15}/> Add product</a></>}
      </div>
    </header>

    {message && <p className={styles.managerMessage}>{message}</p>}

    {mode === "catalog" && <section className={styles.catalogGrid}>
      {loading && !products.length ? <div className={styles.managerEmpty}>Loading catalog…</div> : products.length ? products.map((product) => <article className={styles.catalogCard} key={product.id}>
        <div className={styles.catalogVisual}>{product.imageUrl ? <img src={product.imageUrl} alt=""/> : <span>{product.format}</span>}</div>
        <div className={styles.catalogCopy}><div className={styles.catalogMeta}><span>{product.shelf}</span><strong className={product.published ? styles.statusLive : styles.statusDraft}>{product.published ? "LIVE" : "DRAFT"}</strong></div><h2>{product.name}</h2><p>{product.priceText || "No price set"} · {product.format} · {product.lifecycleStatus || "ACTIVE"} · Priority {product.priority ?? 50}</p><div className={styles.catalogActions}>{product.published && <a href={marketplaceProductPath(product.slug)} target="_blank" rel="noreferrer"><ExternalLink size={13}/> View</a>}<a href={`/manage?edit=${encodeURIComponent(product.id)}`}><Pencil size={13}/> Edit</a><button type="button" onClick={() => void toggle(product)}>{product.published ? "Unpublish" : "Publish"}</button><button className={styles.danger} type="button" onClick={() => void remove(product)} aria-label={`Delete ${product.name}`}><Trash2 size={13}/></button></div></div>
      </article>) : <div className={styles.managerEmpty}>No products yet. <a href="/manage?mode=add">Add the first product.</a></div>}
    </section>}

    {mode === "add" && <form className={styles.managerPanel} onSubmit={submitCreate}><div className={styles.managerForm}>{formFields(false)}</div><div className={styles.managerSubmit}><span>PNG, JPG or WEBP up to 2 MB.</span><button type="submit" disabled={loading}>{loading ? "Saving…" : "Save product"}</button></div></form>}

    {mode === "edit" && (loading && !editing ? <div className={styles.managerEmpty}>Loading product…</div> : editing ? <form key={editing.id} className={styles.managerPanel} onSubmit={submitEdit}><div className={styles.managerForm}>{formFields(true)}</div><div className={styles.managerSubmit}><span>Changes update this product; no duplicate catalog is created.</span><button type="submit" disabled={loading}>{loading ? "Saving…" : "Save changes"}</button></div></form> : <div className={styles.managerEmpty}>That product could not be found. <a href="/manage">Return to catalog.</a></div>)}
  </div></main>;
}
