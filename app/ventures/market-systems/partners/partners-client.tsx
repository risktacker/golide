"use client";

import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./partner-engine.module.css";
import { BrandLockup } from "../../../brand-mark";

type Stage = "NEW" | "CONTACTED" | "REPLIED" | "PARTNER" | "SALE" | "NO_REPLY";
type View = "find" | "pipeline" | "ideas" | "reports";

type Product = { id: string; slug: string; name: string; affiliate_rate: number; lifecycle_status: string };
type Prospect = {
  id: string; name: string; platform: string; handle: string; profile_url: string; contact: string;
  audience_size: number; audience_market: string; activity_evidence: string; buyer_intent_evidence: string;
  monetization_evidence: string; reason: string; personal_hook: string; outreach_message: string;
  affiliate_link: string; notes: string; created_at: number; updated_at: number;
};
type Match = {
  id: string; prospect_id: string; product_id: string; fit_score: number; reason: string;
  personal_hook: string; outreach_message: string; commission_rate: number; status: Stage;
  conversions: number; revenue_cents: number; created_at: number; updated_at: number;
};
type Opportunity = {
  id: string; title: string; niche: string; audience_problem: string; creator_signals: string;
  audience_market: string; saturation: string; linked_product_id: string; created_at: number;
};
type OpportunityCreator = { id: string; opportunity_id: string; prospect_id: string };
type SearchRun = {
  id: string; mode: string; product_id: string; niche: string; target_url: string;
  status: "QUEUED" | "RUNNING" | "DONE" | "FAILED"; profiles_added: number; web_search_calls: number;
  estimated_cost_usd: number; last_error: string; created_at: number;
};
type Coverage = {
  productId: string; productName: string; found: number; toContact: number; waiting: number; talking: number;
  partners: number; notNow: number; conversions: number; revenueCents: number; reachableAudience: number; channels: string[];
};
type Budget = { dailyUsedUsd: number; dailyLimitUsd: number; monthlyUsedUsd: number; monthlyLimitUsd: number; runsLeftToday: number };
type Snapshot = {
  products: Product[]; prospects: Prospect[]; matches: Match[]; opportunities: Opportunity[];
  opportunityCreators: OpportunityCreator[]; searchRuns: SearchRun[]; coverage: Coverage[]; researchBudget?: Budget;
};
type Card = { match: Match; prospect: Prospect };

const EMPTY: Snapshot = { products: [], prospects: [], matches: [], opportunities: [], opportunityCreators: [], searchRuns: [], coverage: [] };
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "LinkedIn"];

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}
function money(cents: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format((cents || 0) / 100);
}
function when(ms: number) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(ms);
}
function sourcesOf(notes: string) {
  const match = notes.match(/(?:Research sources|Sources):\s*(.+)/);
  return match ? match[1].split("|").map((s) => s.trim()).filter((s) => s.startsWith("https://")) : [];
}

export default function PartnersClient() {
  const [data, setData] = useState<Snapshot>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("find");
  const [productId, setProductId] = useState("");
  const [working, setWorking] = useState<"" | "search" | "profile" | "scout" | "update">("");
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [showManual, setShowManual] = useState(false);

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/partner-engine", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ error: "The server sent an unreadable reply." }));
    if (!response.ok) throw new Error(result.error || "Request failed.");
    return result;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await api({ action: "snapshot" }) as Snapshot;
      setData(snapshot);
      setProductId((current) => current || snapshot.products[0]?.id || "");
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load the Partner Engine." });
    } finally {
      setLoaded(true);
    }
  }, [api]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Runs one action, then reloads everything so the screen always matches the database.
  const act = useCallback(async (payload: Record<string, unknown>, success?: string, kind: typeof working = "update") => {
    setWorking(kind);
    setNotice(null);
    try {
      const result = await api(payload);
      if (result?.error) setNotice({ kind: "error", text: result.error });
      else if (success) setNotice({ kind: "ok", text: success.replace("{added}", String(result?.added ?? 0)) });
      return result;
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Something went wrong." });
      return null;
    } finally {
      await refresh();
      setWorking("");
    }
  }, [api, refresh]);

  const product = data.products.find((item) => item.id === productId);
  const prospectById = useMemo(() => new Map(data.prospects.map((p) => [p.id, p])), [data.prospects]);
  const cards = useMemo(() => data.matches
    .filter((m) => m.product_id === productId)
    .map((match) => ({ match, prospect: prospectById.get(match.prospect_id) }))
    .filter((c): c is Card => Boolean(c.prospect)), [data.matches, productId, prospectById]);
  const byStage = (...stages: Stage[]) => cards.filter((c) => stages.includes(c.match.status));
  const toContact = byStage("NEW");
  const inProgress = byStage("CONTACTED", "REPLIED").length;
  const budget = data.researchBudget;
  const outOfBudget = budget ? budget.runsLeftToday < 1 : false;

  async function findPartners(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId) return;
    const form = new FormData(event.currentTarget);
    await act({
      action: "search", mode: "PRODUCT", productId,
      platform: form.get("platform"), geography: form.get("geography"), niche: form.get("focus"),
    }, "Found {added} new people to contact.", "search");
  }

  async function addProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await act({
      action: "search", mode: "PROFILE", productId,
      profileUrl: form.get("profileUrl"), niche: form.get("note"),
    }, "Checked. {added} added to your list.", "profile");
    if (result && !result.error) setShowManual(false);
  }

  async function explore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await act({
      action: "search", mode: "AUDIENCE_SCOUT", niche: form.get("audience"), geography: form.get("geography"),
    }, "Explored. {added} creators found for this audience.", "scout");
  }

  const move = (card: Card, status: Stage, text: string) => act({ action: "match-status", id: card.match.id, status }, text);

  const productPicker = (className: string, label: string) => (
    <select className={className} aria-label={label} value={productId} onChange={(e) => setProductId(e.target.value)}>
      {data.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );

  const nav: Array<[View, string, typeof Search, number | null]> = [
    ["find", "Find partners", Search, toContact.length || null],
    ["pipeline", "Pipeline", Users, inProgress || null],
    ["ideas", "Ideas", Lightbulb, data.opportunities.length || null],
    ["reports", "Reports", BarChart3, null],
  ];

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="https://marketplace.golidee.com/"><BrandLockup /></a>
        <p className={styles.appName}>Partner Engine</p>
        <nav className={styles.nav} aria-label="Partner Engine">
          {nav.map(([value, label, Icon, count]) => (
            <button key={value} type="button" className={view === value ? styles.navActive : styles.navItem}
              aria-current={view === value ? "page" : undefined} onClick={() => setView(value)}>
              <Icon size={17} aria-hidden="true" /><span>{label}</span>{count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          {budget && <p className={styles.budget}>
            <span>{budget.runsLeftToday} {budget.runsLeftToday === 1 ? "search" : "searches"} left today</span>
            <small>${budget.monthlyUsedUsd.toFixed(2)} of ${budget.monthlyLimitUsd.toFixed(2)} used this month</small>
          </p>}
          <a className={styles.back} href="https://marketplace.golidee.com/"><ArrowLeft size={14} /> Marketplace</a>
        </div>
      </aside>

      <main className={styles.main}>
        {notice && <p className={notice.kind === "error" ? styles.noticeError : styles.noticeOk} role="status">
          {notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">×</button>
        </p>}

        {!loaded ? <p className={styles.loading}><LoaderCircle className={styles.spin} size={16} /> Loading…</p> :
          !data.products.length ? (
            <section className={styles.emptyLarge}>
              <h1>Add a product first.</h1>
              <p>The engine finds partners for products in your marketplace. Add one, then come back.</p>
              <a className={styles.primary} href="/manage?mode=add">Add a product</a>
            </section>
          ) : (
          <>
            {view === "find" && (
              <section>
                <form onSubmit={findPartners} className={styles.ask}>
                  <h1 className={styles.question}>
                    <span>Who should sell</span>
                    {productPicker(styles.headlinePicker, "Product")}
                    <span>?</span>
                  </h1>
                  <p className={styles.lede}>The engine searches the web for real creators whose audience fits this product and writes the first message for you. Each search takes about a minute.</p>
                  <details className={styles.options}>
                    <summary>Narrow it down</summary>
                    <div className={styles.optionGrid}>
                      <label>Platform
                        <select name="platform" defaultValue=""><option value="">Any</option>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
                      </label>
                      <label>Audience country<input name="geography" placeholder="e.g. Nigeria, UK" /></label>
                      <label className={styles.wide}>Anything specific?<input name="focus" placeholder="e.g. career coaches who post about CVs" /></label>
                    </div>
                  </details>
                  <div className={styles.askActions}>
                    <button className={styles.primary} type="submit" disabled={Boolean(working) || outOfBudget}>
                      {working === "search" ? <><LoaderCircle className={styles.spin} size={16} /> Searching the web…</> : <><Search size={16} /> Find partners</>}
                    </button>
                    <button className={styles.textButton} type="button" onClick={() => setShowManual((v) => !v)}>I already found someone</button>
                  </div>
                  {outOfBudget && <p className={styles.hint}>Today&apos;s search budget is used up. It resets at midnight UTC.</p>}
                </form>

                {showManual && (
                  <form className={styles.manual} onSubmit={addProfile}>
                    <label>Their profile link<input name="profileUrl" type="url" required placeholder="https://www.instagram.com/…" /></label>
                    <label>Why them? (optional)<input name="note" placeholder="e.g. posts weekly about job interviews" /></label>
                    <div className={styles.manualActions}>
                      <button className={styles.primary} type="submit" disabled={Boolean(working) || outOfBudget}>
                        {working === "profile" ? <><LoaderCircle className={styles.spin} size={16} /> Checking…</> : "Check and add"}
                      </button>
                      <span className={styles.hint}>The engine verifies the profile and writes the message. Uses one search.</span>
                    </div>
                  </form>
                )}

                <h2 className={styles.sectionTitle}>Ready to contact <span>{toContact.length}</span></h2>
                {toContact.length ? (
                  <div className={styles.list}>
                    {toContact.map((card) => <ContactCard key={card.match.id} card={card} busy={Boolean(working)}
                      onSent={() => move(card, "CONTACTED", `Moved @${card.prospect.handle} to Waiting for reply.`)}
                      onSkip={() => move(card, "NO_REPLY", `Skipped @${card.prospect.handle}.`)}
                      onCopied={() => setNotice({ kind: "ok", text: "Message copied. Paste it in their DMs or email." })} />)}
                  </div>
                ) : (
                  <p className={styles.empty}>Nobody waiting to be contacted. Press <strong>Find partners</strong> to get a fresh list.</p>
                )}
              </section>
            )}

            {view === "pipeline" && (
              <section>
                <header className={styles.viewHead}>
                  <h1>Pipeline</h1>
                  {productPicker(styles.inlinePicker, "Product")}
                </header>
                <div className={styles.columns}>
                  <Column title="Waiting for reply" items={byStage("CONTACTED")} empty="People you've messaged show up here.">
                    {(card) => <>
                      <button type="button" className={styles.small} disabled={Boolean(working)} onClick={() => move(card, "REPLIED", "Moved to Talking.")}>They replied</button>
                      <button type="button" className={styles.smallQuiet} disabled={Boolean(working)} onClick={() => move(card, "NO_REPLY", "Moved to Not now.")}>No reply</button>
                    </>}
                  </Column>
                  <Column title="Talking" items={byStage("REPLIED")} empty="Replies show up here.">
                    {(card) => <>
                      <button type="button" className={styles.small} disabled={Boolean(working)} onClick={() => move(card, "PARTNER", `@${card.prospect.handle} is now a partner.`)}>They&apos;re in</button>
                      <button type="button" className={styles.smallQuiet} disabled={Boolean(working)} onClick={() => move(card, "NO_REPLY", "Moved to Not now.")}>Not now</button>
                    </>}
                  </Column>
                  <Column title="Partners" items={byStage("PARTNER", "SALE")} empty="Creators who agree to promote show up here." partner>
                    {(card) => <PartnerTools card={card} busy={Boolean(working)}
                      onSale={(amountUsd) => act({ action: "record-sale", id: card.match.id, amountUsd }, "Sale logged.")}
                      onSave={(values) => act({ action: "update-prospect", id: card.prospect.id, ...values }, "Saved.")} />}
                  </Column>
                </div>
                {byStage("NO_REPLY").length > 0 && (
                  <details className={styles.parked}>
                    <summary>Not now ({byStage("NO_REPLY").length})</summary>
                    <ul>
                      {byStage("NO_REPLY").map((card) => <li key={card.match.id}>
                        <a href={card.prospect.profile_url} target="_blank" rel="noreferrer">@{card.prospect.handle}</a>
                        <span>{card.prospect.platform}</span>
                        <button type="button" className={styles.textButton} disabled={Boolean(working)} onClick={() => move(card, "NEW", "Moved back to Ready to contact.")}>Bring back</button>
                        <button type="button" className={styles.iconQuiet} aria-label={`Delete @${card.prospect.handle}`} disabled={Boolean(working)}
                          onClick={() => { if (confirm(`Delete @${card.prospect.handle} for good?`)) void act({ action: "delete-prospect", id: card.prospect.id }, "Deleted."); }}><Trash2 size={14} /></button>
                      </li>)}
                    </ul>
                  </details>
                )}
              </section>
            )}

            {view === "ideas" && (
              <section>
                <form className={styles.ask} onSubmit={explore}>
                  <h1 className={styles.questionSmall}>What audience could your next product serve?</h1>
                  <p className={styles.lede}>Describe a group of people. The engine finds creators who already talk to them and the problem they keep raising, before you build anything.</p>
                  <div className={styles.scoutRow}>
                    <input name="audience" required placeholder="e.g. nurses moving abroad, first-time freelancers in Lagos" aria-label="Audience" />
                    <input name="geography" placeholder="Country (optional)" aria-label="Country" />
                    <button className={styles.primary} type="submit" disabled={Boolean(working) || outOfBudget}>
                      {working === "scout" ? <><LoaderCircle className={styles.spin} size={16} /> Exploring…</> : "Explore"}
                    </button>
                  </div>
                </form>
                {data.opportunities.length ? (
                  <div className={styles.list}>
                    {data.opportunities.map((idea) => {
                      const creators = data.opportunityCreators.filter((c) => c.opportunity_id === idea.id).map((c) => prospectById.get(c.prospect_id)).filter(Boolean) as Prospect[];
                      return <article className={styles.idea} key={idea.id}>
                        <h2>{idea.title}</h2>
                        <p>{idea.audience_problem}</p>
                        {idea.saturation && <p className={styles.muted}>Competition: {idea.saturation}</p>}
                        {creators.length > 0 && <p className={styles.creatorLinks}>
                          {creators.map((c) => <a key={c.id} href={c.profile_url} target="_blank" rel="noreferrer">@{c.handle} <small>{compact(c.audience_size)}</small></a>)}
                        </p>}
                        <div className={styles.ideaActions}>
                          <label>Linked product
                            <select value={idea.linked_product_id || ""} disabled={Boolean(working)}
                              onChange={(e) => void act({ action: "opportunity-link-product", id: idea.id, productId: e.target.value }, e.target.value ? "Linked. Its creators are now in that product's list." : "Unlinked.")}>
                              <option value="">Not built yet</option>
                              {data.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </label>
                          <a className={styles.textButton} href="/manage?mode=add" target="_blank" rel="noreferrer">Create a product</a>
                          <button type="button" className={styles.iconQuiet} aria-label="Delete idea" disabled={Boolean(working)}
                            onClick={() => { if (confirm(`Delete "${idea.title}"?`)) void act({ action: "opportunity-delete", id: idea.id }, "Idea deleted."); }}><Trash2 size={14} /></button>
                        </div>
                      </article>;
                    })}
                  </div>
                ) : <p className={styles.empty}>No ideas yet. Describe an audience above to explore one.</p>}
              </section>
            )}

            {view === "reports" && (
              <section>
                <header className={styles.viewHead}><h1>Reports</h1></header>
                <div className={styles.table} role="table" aria-label="Results by product">
                  <div className={styles.tr} role="row">
                    {["Product", "Found", "Contacted", "Replied", "Partners", "Sales", "Revenue"].map((h) => <span key={h} role="columnheader">{h}</span>)}
                  </div>
                  {data.coverage.map((row) => <div className={styles.tr} role="row" key={row.productId}>
                    <span role="cell">{row.productName}</span>
                    <span role="cell">{row.found}</span>
                    <span role="cell">{row.found - row.toContact}</span>
                    <span role="cell">{row.talking + row.partners}</span>
                    <span role="cell">{row.partners}</span>
                    <span role="cell">{row.conversions}</span>
                    <span role="cell">{money(row.revenueCents)}</span>
                  </div>)}
                </div>

                <h2 className={styles.sectionTitle}>Search history</h2>
                {data.searchRuns.length ? <ul className={styles.history}>
                  {data.searchRuns.map((run) => {
                    const name = run.mode === "AUDIENCE_SCOUT" ? `Explored: ${run.niche}` :
                      run.mode === "PROFILE" ? `Checked: ${run.target_url.replace(/^https:\/\/(www\.)?/, "")}` :
                      `Partners for ${data.products.find((p) => p.id === run.product_id)?.name || "a deleted product"}`;
                    return <li key={run.id}>
                      <div>
                        <strong>{name}</strong>
                        <small>{when(run.created_at)} — {run.status === "DONE" ? `${run.profiles_added} added` : run.status === "FAILED" ? "Failed" : "Running"}, ${Number(run.estimated_cost_usd || 0).toFixed(3)}</small>
                        {run.last_error && <p className={styles.error}>{run.last_error}</p>}
                      </div>
                      <div className={styles.historyActions}>
                        {run.status === "FAILED" && <button type="button" className={styles.small} disabled={Boolean(working) || outOfBudget}
                          onClick={() => void act({ action: "search-retry", id: run.id }, "Retried. {added} added.", "search")}><RotateCcw size={13} /> Retry</button>}
                        {run.status !== "RUNNING" && <button type="button" className={styles.iconQuiet} aria-label="Remove from history" disabled={Boolean(working)}
                          onClick={() => void act({ action: "search-delete", id: run.id })}><Trash2 size={14} /></button>}
                      </div>
                    </li>;
                  })}
                </ul> : <p className={styles.empty}>No searches yet.</p>}
                {budget && <p className={styles.hint}>Spending limits: $0.10 per search, ${budget.dailyLimitUsd.toFixed(2)} per day, ${budget.monthlyLimitUsd.toFixed(2)} per month. Used today: ${budget.dailyUsedUsd.toFixed(2)}.</p>}
              </section>
            )}
          </>
        )}
        {product && view === "find" && product.affiliate_rate > 0 && <p className={styles.footnote}>Messages offer {product.affiliate_rate}% commission on {product.name}.</p>}
      </main>
    </div>
  );
}

function ContactCard({ card, busy, onSent, onSkip, onCopied }: { card: Card; busy: boolean; onSent: () => void; onSkip: () => void; onCopied: () => void }) {
  const { match, prospect } = card;
  const message = match.outreach_message || prospect.outreach_message;
  const sources = sourcesOf(prospect.notes);
  async function copy() {
    try { await navigator.clipboard.writeText(message); onCopied(); } catch { /* clipboard blocked; text stays selectable */ }
  }
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <div>
          <h3>{prospect.name || `@${prospect.handle}`}</h3>
          <p className={styles.muted}>@{prospect.handle} on {prospect.platform}, {compact(prospect.audience_size)} followers</p>
        </div>
        <span className={styles.fit} title="How well their audience fits this product">{match.fit_score}% fit</span>
      </header>
      <p className={styles.why}>{match.reason || prospect.reason}</p>
      <blockquote className={styles.message}>{message}</blockquote>
      <div className={styles.cardActions}>
        <button type="button" className={styles.primary} onClick={() => void copy()}><Copy size={15} /> Copy message</button>
        <a className={styles.secondary} href={prospect.profile_url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open profile</a>
        <button type="button" className={styles.secondary} disabled={busy} onClick={onSent}><Check size={15} /> I sent it</button>
        <button type="button" className={styles.textButton} disabled={busy} onClick={onSkip}>Not a fit</button>
      </div>
      <details className={styles.evidence}>
        <summary>Why the engine picked them</summary>
        <dl>
          {prospect.audience_market && <><dt>Audience</dt><dd>{prospect.audience_market}</dd></>}
          {prospect.activity_evidence && <><dt>Recently active</dt><dd>{prospect.activity_evidence}</dd></>}
          {prospect.buyer_intent_evidence && <><dt>Audience buys</dt><dd>{prospect.buyer_intent_evidence}</dd></>}
          {prospect.monetization_evidence && <><dt>Already earns</dt><dd>{prospect.monetization_evidence}</dd></>}
          {prospect.contact && <><dt>Contact</dt><dd>{prospect.contact}</dd></>}
        </dl>
        {sources.length > 0 && <p className={styles.sources}>Checked on: {sources.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer">{i ? ", " : ""}{new URL(url).hostname.replace(/^www\./, "")}</a>)}</p>}
      </details>
    </article>
  );
}

function Column({ title, items, empty, partner = false, children }: { title: string; items: Card[]; empty: string; partner?: boolean; children: (card: Card) => ReactNode }) {
  return (
    <section className={partner ? styles.columnPartner : styles.column}>
      <h2>{title} <span>{items.length}</span></h2>
      {items.length ? items.map((card) => (
        <article className={styles.mini} key={card.match.id}>
          <a href={card.prospect.profile_url} target="_blank" rel="noreferrer"><strong>{card.prospect.name || `@${card.prospect.handle}`}</strong></a>
          <small>@{card.prospect.handle} on {card.prospect.platform}, {compact(card.prospect.audience_size)}</small>
          <div className={styles.miniActions}>{children(card)}</div>
        </article>
      )) : <p className={styles.columnEmpty}>{empty}</p>}
    </section>
  );
}

function PartnerTools({ card, busy, onSale, onSave }: { card: Card; busy: boolean; onSale: (amountUsd: number) => void; onSave: (values: { contact: string; affiliateLink: string; notes: string }) => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div className={styles.partnerTools}>
      <p className={styles.muted}>{card.match.conversions} {card.match.conversions === 1 ? "sale" : "sales"}, {money(card.match.revenue_cents)}</p>
      <form className={styles.saleForm} onSubmit={(e) => { e.preventDefault(); onSale(Number(amount || 0)); setAmount(""); }}>
        <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Sale $" aria-label="Sale amount in dollars" />
        <button type="submit" className={styles.small} disabled={busy}>Log a sale</button>
      </form>
      <details>
        <summary>Contact and link</summary>
        <form className={styles.editForm} onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          onSave({ contact: String(form.get("contact") || ""), affiliateLink: String(form.get("affiliateLink") || ""), notes: String(form.get("notes") || "") });
        }}>
          <label>Contact<input name="contact" defaultValue={card.prospect.contact} placeholder="Email or DM handle" /></label>
          <label>Their affiliate link<input name="affiliateLink" defaultValue={card.prospect.affiliate_link} placeholder="https://whop.com/…" /></label>
          <label>Notes<textarea name="notes" rows={2} defaultValue={card.prospect.notes} /></label>
          <button type="submit" className={styles.small} disabled={busy}>Save</button>
        </form>
      </details>
    </div>
  );
}
