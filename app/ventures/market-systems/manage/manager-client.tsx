"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { MarketProduct } from "../market-data";
import styles from "../market.module.css";

const shelves = ["Career", "Creator", "Business", "Productivity", "Learning"];
const MAX_IMAGE_BYTES = 2_000_000;

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) {
      reject(new Error('Use a PNG, JPG or WEBP image.'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error('Image is too large. Keep it under 2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

export default function ManagerClient() {
  const searchParams = useSearchParams();
  const requestedShelf = searchParams.get("shelf") || "Career";
  const initialShelf = shelves.includes(requestedShelf) ? requestedShelf : "Career";

  const [passcode, setPasscode] = useState("");
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shelf, setShelf] = useState(initialShelf);
  const [editing, setEditing] = useState<MarketProduct | null>(null);
  const [editShelf, setEditShelf] = useState("Career");
  const [createImageData, setCreateImageData] = useState("");
  const [editImageData, setEditImageData] = useState("");

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

  async function refreshProducts(successMessage?: string) {
    const data = await api({ action: "list" });
    setProducts(data.products || []);
    if (successMessage) setMessage(successMessage);
  }

  async function loadProducts() {
    setLoading(true); setMessage("");
    try {
      await refreshProducts("Publisher unlocked.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not unlock publisher.");
    } finally { setLoading(false); }
  }

  async function chooseCreateImage(file?: File) {
    if (!file) return;
    try {
      setCreateImageData(await readImage(file));
      setMessage("Image ready to upload with this product.");
    } catch (error) {
      setCreateImageData("");
      setMessage(error instanceof Error ? error.message : "Could not use that image.");
    }
  }

  async function chooseEditImage(file?: File) {
    if (!file) return;
    try {
      setEditImageData(await readImage(file));
      setMessage("Replacement image ready. Save changes to apply it.");
    } catch (error) {
      setEditImageData("");
      setMessage(error instanceof Error ? error.message : "Could not use that image.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
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
          imageUrl: createImageData || form.get("imageUrl"),
          whopUrl: form.get("whopUrl"),
          featured: form.get("featured") === "on",
          published: form.get("published") === "on",
          sortOrder: form.get("sortOrder"),
        },
      });
      formElement.reset();
      setCreateImageData("");
      setShelf(initialShelf);
      await refreshProducts(data.published ? `Published: ${data.slug}` : `Saved as draft: ${data.slug}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally { setLoading(false); }
  }

  function startEdit(product: MarketProduct) {
    setEditing(product);
    setEditShelf(product.shelf);
    setEditImageData("");
    setMessage(`Editing: ${product.name}`);
    requestAnimationFrame(() => document.getElementById("market-edit-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      await api({
        action: "update",
        id: editing.id,
        product: {
          name: form.get("name"),
          shelf: editShelf,
          format: form.get("format"),
          priceText: form.get("priceText"),
          summary: form.get("summary"),
          transformation: form.get("transformation"),
          imageUrl: editImageData || form.get("imageUrl"),
          whopUrl: form.get("whopUrl"),
          featured: form.get("featured") === "on",
          published: form.get("published") === "on",
          sortOrder: form.get("sortOrder"),
        },
      });
      const name = String(form.get("name") || editing.name);
      setEditing(null);
      setEditImageData("");
      await refreshProducts(`Updated: ${name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update product.");
    } finally { setLoading(false); }
  }

  async function toggle(product: MarketProduct) {
    setLoading(true); setMessage("");
    try {
      await api({ action: "toggle", id: product.id, published: !product.published });
      await refreshProducts(product.published ? "Product moved to draft." : "Product published to the shelf.");
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
      if (editing?.id === product.id) setEditing(null);
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
        <p>Use this publisher for every new digital product. Upload the product image directly, add the Whop purchase link, choose the shelf, then publish. Published products can be edited below without recreating them.</p>
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
        <label>Price display<input name="priceText" placeholder="$27"/></label>
        <label className={styles.full}>Short promise / summary<textarea name="summary" required placeholder="What the buyer gets and the problem it solves."/></label>
        <label className={styles.full}>Transformation<textarea name="transformation" placeholder="From scattered applications to a repeatable job-search system."/></label>
        <label>Whop purchase URL<input name="whopUrl" type="url" placeholder="https://whop.com/..."/></label>
        <label>Upload product image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event)=>chooseCreateImage(event.currentTarget.files?.[0])}/></label>
        <label>Or image path / URL<input name="imageUrl" placeholder="Optional: /market/... or https://..."/></label>
        {createImageData && <div className={styles.full} style={{display:"flex",alignItems:"center",gap:14}}><img src={createImageData} alt="Selected product preview" style={{width:110,height:110,objectFit:"contain",background:"#071016",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/><span style={{color:"#91a7b1",fontSize:12}}>Direct image selected <Upload size={14} style={{display:"inline",verticalAlign:"middle"}}/></span></div>}
        <label>Sort order<input name="sortOrder" type="number" defaultValue="0"/></label>
        <div className={styles.publishRow}>
          <label><input name="featured" type="checkbox"/> Featured</label>
          <label><input name="published" type="checkbox"/> Publish immediately</label>
          <button type="submit" disabled={loading}>Save product</button>
        </div>
      </form>
      <p className={styles.managerNote}>Direct upload accepts PNG, JPG or WEBP up to 2 MB. A path or HTTPS URL is still available as a fallback.</p>

      {products.length > 0 && <div className={styles.productTable}>
        {products.map((product)=><div className={styles.productRow} key={product.id}>
          <div><strong>{product.name}</strong><br/><small>/{product.slug}</small></div>
          <span>{product.shelf}</span><span>{product.format}</span>
          <span className={product.published ? styles.statusLive : styles.statusDraft}>{product.published ? "LIVE" : "DRAFT"}</span>
          <div className={styles.rowActions}>
            {product.published && <Link href={`/ventures/market-systems/${product.slug}`} target="_blank" aria-label="Open product"><ExternalLink size={14}/></Link>}
            <button type="button" onClick={()=>startEdit(product)}><Pencil size={12}/> Edit</button>
            <button type="button" onClick={()=>toggle(product)}>{product.published ? "Unpublish" : "Publish"}</button>
            <button className={styles.danger} type="button" onClick={()=>remove(product)}><Trash2 size={12}/></button>
          </div>
        </div>)}
      </div>}

      {editing && <section id="market-edit-form" style={{marginTop:28}}>
        <div className={styles.managerHead} style={{marginBottom:16}}>
          <div><p className={styles.eyebrow}>EDIT PRODUCT</p><h1 style={{fontSize:"clamp(34px,5vw,58px)"}}>{editing.name}</h1></div>
          <button type="button" onClick={()=>setEditing(null)} aria-label="Cancel editing" style={{width:42,height:42,borderRadius:"50%",border:"1px solid rgba(255,255,255,.12)",background:"#0b151b",color:"#dcebef",display:"grid",placeItems:"center",cursor:"pointer"}}><X size={18}/></button>
        </div>
        <form key={editing.id} className={styles.managerForm} onSubmit={submitEdit}>
          <label>Product name<input name="name" required defaultValue={editing.name}/></label>
          <label>Shelf<select name="shelf" value={editShelf} onChange={(event)=>setEditShelf(event.target.value)}>{shelves.map((shelfName)=><option key={shelfName}>{shelfName}</option>)}</select></label>
          <label>Format<input name="format" defaultValue={editing.format}/></label>
          <label>Price display<input name="priceText" defaultValue={editing.priceText || ""}/></label>
          <label className={styles.full}>Short promise / summary<textarea name="summary" required defaultValue={editing.summary}/></label>
          <label className={styles.full}>Transformation<textarea name="transformation" defaultValue={editing.transformation || ""}/></label>
          <label>Whop purchase URL<input name="whopUrl" type="url" defaultValue={editing.whopUrl || ""} placeholder="https://whop.com/..."/></label>
          <label>Upload replacement image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event)=>chooseEditImage(event.currentTarget.files?.[0])}/></label>
          <label>Or image path / URL<input name="imageUrl" defaultValue={editing.imageUrl?.startsWith('data:image/') ? '' : (editing.imageUrl || '')} placeholder="Optional: /market/... or https://..."/></label>
          {(editImageData || editing.imageUrl) && <div className={styles.full} style={{display:"flex",alignItems:"center",gap:14}}><img src={editImageData || editing.imageUrl} alt="Product preview" style={{width:130,height:130,objectFit:"contain",background:"#071016",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/><span style={{color:"#91a7b1",fontSize:12}}>{editImageData ? 'Replacement ready — save changes.' : 'Current product image'}</span></div>}
          <label>Sort order<input name="sortOrder" type="number" defaultValue={editing.sortOrder ?? 0}/></label>
          <div className={styles.publishRow}>
            <label><input name="featured" type="checkbox" defaultChecked={editing.featured}/> Featured</label>
            <label><input name="published" type="checkbox" defaultChecked={editing.published}/> Published</label>
            <button type="button" onClick={()=>setEditing(null)} style={{marginLeft:"auto",background:"#0b151b",color:"#dcebef",border:"1px solid rgba(255,255,255,.12)"}}>Cancel</button>
            <button type="submit" disabled={loading} style={{marginLeft:0}}>Save changes</button>
          </div>
        </form>
      </section>}
    </div>
  </main>;
}
