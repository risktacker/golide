"use client";

import {
  ArrowLeft,
  BarChart3,
  Check,
  Clipboard,
  ExternalLink,
  LoaderCircle,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./partner-engine.module.css";

type SearchMode = "PRODUCT" | "AUTO" | "AUDIENCE_SCOUT" | "EXPAND" | "ALL";
type Stage = "NEW" | "CONTACTED" | "REPLIED" | "PARTNER" | "SALE" | "NO_REPLY";
type Tab = "partners" | "coverage" | "opportunities" | "searches";

type Product = {
  id: string;
  slug: string;
  name: string;
  shelf: string;
  lifecycle_status: string;
  target_audience: string;
  problem_solved: string;
  keywords: string;
  creator_niches: string;
  target_geographies: string;
  affiliate_rate: number;
  launch_date: string;
  priority: number;
  last_partner_search_at: number | null;
  published: number;
  updated_at: number;
};

type Prospect = {
  id: string;
  name: string;
  platform: string;
  handle: string;
  profile_url: string;
  contact: string;
  audience_size: number;
  audience_market: string;
  activity_evidence: string;
  buyer_intent_evidence: string;
  monetization_evidence: string;
  reason: string;
  personal_hook: string;
  outreach_message: string;
  status: Stage;
  affiliate_link: string;
  notes: string;
  last_contacted_at: number | null;
  created_at: number;
  updated_at: number;
};

type Match = {
  id: string;
  prospect_id: string;
  product_id: string;
  fit_score: number;
  reason: string;
  personal_hook: string;
  outreach_message: string;
  commission_rate: number;
  status: Stage;
  conversions: number;
  revenue_cents: number;
  created_at: number;
  updated_at: number;
};

type Opportunity = {
  id: string;
  title: string;
  niche: string;
  audience_problem: string;
  creator_signals: string;
  audience_market: string;
  creator_count: number;
  estimated_reach: number;
  saturation: string;
  status: string;
  linked_product_id: string;
  notes: string;
  created_at: number;
  updated_at: number;
};

type OpportunityCreator = {
  id: string;
  opportunity_id: string;
  prospect_id: string;
  notes: string;
  created_at: number;
};

type SearchRun = {
  id: string;
  mode: SearchMode;
  product_id: string;
  niche: string;
  geography: string;
  platform: string;
  min_followers: number;
  exclude_product_sellers: number;
  query_brief: string;
  status: "QUEUED" | "RUNNING" | "DONE" | "FAILED";
  created_at: number;
  updated_at: number;
};

type Coverage = {
  productId: string;
  productName: string;
  lifecycleStatus: string;
  qualified: number;
  contacted: number;
  replied: number;
  partners: number;
  sales: number;
  conversions: number;
  revenueCents: number;
  reachableAudience: number;
  channels: string[];
  channelGaps: string[];
  markets: string[];
  targetGeographies: string;
};

type Snapshot = {
  products: Product[];
  prospects: Prospect[];
  matches: Match[];
  opportunities: Opportunity[];
  opportunityCreators: OpportunityCreator[];
  searchRuns: SearchRun[];
  coverage: Coverage[];
};

const stages: Stage[] = ["NEW", "CONTACTED", "REPLIED", "PARTNER", "SALE", "NO_REPLY"];
const opportunityStages = [
  "AUDIENCE_OPPORTUNITY",
  "PROPOSED_PRODUCT",
  "PRE_LAUNCH",
  "PRODUCT_CREATED",
  "PARTNER_RECRUITMENT",
  "LAUNCH",
  "ACTIVE",
  "MATURE",
  "PAUSED",
];

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

function money(cents: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format((cents || 0) / 100);
}

function pretty(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

function nextAction(stage: Stage) {
  return ({
    NEW: "Send the personalized outreach.",
    CONTACTED: "Watch for a reply and follow up with context, not a generic bump.",
    REPLIED: "Qualify interest, share the product for review and agree on the tracked offer.",
    PARTNER: "Make sure the tracked link and creative are live, then monitor conversions.",
    SALE: "Keep what converted, deepen the relationship and test another suitable product.",
    NO_REPLY: "Park or re-engage only when there is a genuinely new reason to contact them.",
  } as Record<Stage, string>)[stage];
}

export default function PartnersClient() {
  const [data, setData] = useState<Snapshot>({ products: [], prospects: [], matches: [], opportunities: [], opportunityCreators: [], searchRuns: [], coverage: [] });
  const [tab, setTab] = useState<Tab>("partners");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [stage, setStage] = useState<Stage | "ALL">("ALL");
  const [mode, setMode] = useState<SearchMode>("PRODUCT");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showOpportunity, setShowOpportunity] = useState(false);

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/partner-engine", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Partner Engine request failed.");
    return result;
  }, []);

  const refresh = useCallback(async (success?: string) => {
    setBusy(true);
    try {
      const snapshot = await api({ action: "snapshot" }) as Snapshot;
      setData(snapshot);
      if (!selectedProduct && snapshot.products.length) setSelectedProduct(snapshot.products[0].id);
      if (success) setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load Partner Engine.");
    } finally {
      setBusy(false);
    }
  }, [api, selectedProduct]);

  useEffect(() => { void refresh(); }, [refresh]);

  const productById = useMemo(
    () => new Map(data.products.map((product) => [product.id, product])),
    [data.products],
  );
  const prospectById = useMemo(
    () => new Map(data.prospects.map((prospect) => [prospect.id, prospect])),
    [data.prospects],
  );

  const selectedMatches = useMemo(() => {
    return data.matches.filter((match) =>
      (!selectedProduct || match.product_id === selectedProduct) &&
      (stage === "ALL" || match.status === stage)
    );
  }, [data.matches, selectedProduct, stage]);

  const relationshipCards = useMemo(() => {
    return selectedMatches
      .map((match) => ({ match, prospect: prospectById.get(match.prospect_id) }))
      .filter((item): item is { match: Match; prospect: Prospect } => Boolean(item.prospect));
  }, [selectedMatches, prospectById]);

  const selectedCoverage = data.coverage.find((item) => item.productId === selectedProduct);
  const totalReach = data.coverage.reduce((sum, item) => sum + item.reachableAudience, 0);
  const totalPartners = data.coverage.reduce((sum, item) => sum + item.partners, 0);
  const totalSales = data.coverage.reduce((sum, item) => sum + item.sales, 0);

  async function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if ((mode === "PRODUCT" || mode === "EXPAND") && !selectedProduct) {
      setMessage("Choose a product first.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const result = await api({
        action: "search",
        mode,
        productId: selectedProduct,
        niche: form.get("niche"),
        geography: form.get("geography"),
        platform: form.get("platform"),
        minFollowers: form.get("minFollowers"),
        excludeProductSellers: form.get("excludeProductSellers") === "on" || mode === "AUDIENCE_SCOUT",
      });
      await refresh(`${result.queued} search job${result.queued === 1 ? "" : "s"} queued.`);
      setTab("searches");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not queue search.");
      setBusy(false);
    }
  }

  async function addProspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      await api({
        action: "create-prospect",
        productId: form.get("productId"),
        prospect: {
          name: form.get("name"), platform: form.get("platform"), handle: form.get("handle"),
          profileUrl: form.get("profileUrl"), contact: form.get("contact"),
          audienceSize: form.get("audienceSize"), audienceMarket: form.get("audienceMarket"),
          activityEvidence: form.get("activityEvidence"), buyerIntentEvidence: form.get("buyerIntentEvidence"),
          monetizationEvidence: form.get("monetizationEvidence"), reason: form.get("reason"),
          personalHook: form.get("personalHook"), outreachMessage: form.get("outreachMessage"),
          affiliateLink: form.get("affiliateLink"), notes: form.get("notes"), fitScore: form.get("fitScore"),
        },
      });
      setShowAdd(false);
      await refresh("Prospect added and linked to product.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add prospect.");
      setBusy(false);
    }
  }

  async function changeMatchStage(match: Match, next: Stage) {
    setBusy(true);
    try {
      await api({ action: "match-status", id: match.id, status: next });
      await refresh(`Moved to ${pretty(next)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update stage.");
      setBusy(false);
    }
  }

  async function removeProspect(prospect: Prospect) {
    if (!confirm(`Remove @${prospect.handle} and all product relationships?`)) return;
    setBusy(true);
    try {
      await api({ action: "delete-prospect", id: prospect.id });
      await refresh("Prospect removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove prospect.");
      setBusy(false);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage("Outreach copied.");
  }

  async function addOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api({
        action: "opportunity-create",
        opportunity: {
          title: form.get("title"), niche: form.get("niche"), audienceProblem: form.get("audienceProblem"),
          creatorSignals: form.get("creatorSignals"), audienceMarket: form.get("audienceMarket"),
          creatorCount: form.get("creatorCount"), estimatedReach: form.get("estimatedReach"),
          saturation: form.get("saturation"), notes: form.get("notes"),
        },
      });
      setShowOpportunity(false);
      await refresh("Audience opportunity saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save opportunity.");
      setBusy(false);
    }
  }

  async function linkOpportunityCreator(item: Opportunity, prospectId: string) {
    if (!prospectId) return;
    setBusy(true);
    try {
      await api({ action: "opportunity-link-creator", opportunityId: item.id, prospectId });
      await refresh("Creator linked to audience opportunity.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not link creator.");
      setBusy(false);
    }
  }

  async function unlinkOpportunityCreator(item: Opportunity, prospectId: string) {
    setBusy(true);
    try {
      await api({ action: "opportunity-unlink-creator", opportunityId: item.id, prospectId });
      await refresh("Creator removed from audience opportunity.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not unlink creator.");
      setBusy(false);
    }
  }

  async function linkOpportunity(item: Opportunity, productId: string) {
    setBusy(true);
    try {
      await api({ action: "opportunity-link-product", id: item.id, productId });
      await refresh(productId ? "Opportunity linked to product." : "Opportunity unlinked.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not link opportunity.");
      setBusy(false);
    }
  }

  async function moveOpportunity(item: Opportunity, next: string) {
    setBusy(true);
    try {
      await api({ action: "opportunity-status", id: item.id, status: next });
      await refresh(`Opportunity moved to ${pretty(next)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update opportunity.");
      setBusy(false);
    }
  }

  async function removeOpportunity(item: Opportunity) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    setBusy(true);
    try {
      await api({ action: "opportunity-delete", id: item.id });
      await refresh("Opportunity removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove opportunity.");
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <a className={styles.brand} href="https://marketplace.golidee.com/"><img src="/marketplace-assets/golide-logo.png" alt="GOLIDE"/></a>
          <div className={styles.topLinks}>
            <a className={styles.domainLink} href="https://marketplace.golidee.com/"><ArrowLeft size={13}/><span>Marketplace</span></a>
            <button className={styles.iconButton} type="button" onClick={() => void refresh("Engine refreshed.")} disabled={busy}>
              <RefreshCw size={14} className={busy ? styles.spin : ""}/> Refresh
            </button>
          </div>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><Sparkles size={13}/> MULTI-PRODUCT DISTRIBUTION</p>
            <h1>Partner <span>Engine.</span></h1>
            <p className={styles.heroText}>Products are inputs, not assumptions. Search for a specific product, let the engine rotate priorities, or scout audiences before we build.</p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.secondaryButton} type="button" onClick={() => { setShowOpportunity(true); setTab("opportunities"); }}><Radar size={14}/> New opportunity</button>
            <button className={styles.primaryButton} type="button" onClick={() => setShowAdd((value) => !value)}><Plus size={14}/> Add prospect</button>
          </div>
        </section>

        <section className={styles.commandPanel}>
          <div className={styles.commandModes}>
            {([
              ["PRODUCT", "Product Search", Search],
              ["AUTO", "Auto Search", Sparkles],
              ["AUDIENCE_SCOUT", "Audience Scout", Radar],
              ["EXPAND", "Expand Search", Users],
              ["ALL", "All Products", BarChart3],
            ] as const).map(([value, label, Icon]) => (
              <button key={value} type="button" className={mode === value ? styles.modeActive : styles.modeButton} onClick={() => setMode(value)}>
                <Icon size={14}/><span>{label}</span>
              </button>
            ))}
          </div>
          <form className={styles.searchForm} onSubmit={runSearch}>
            <label>Product
              <select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} disabled={mode === "AUDIENCE_SCOUT" || mode === "AUTO" || mode === "ALL"}>
                <option value="">Choose product</option>
                {data.products.map((product) => <option key={product.id} value={product.id}>{product.name} · {pretty(product.lifecycle_status)}</option>)}
              </select>
            </label>
            <label>Niche / audience<input name="niche" placeholder={mode === "AUDIENCE_SCOUT" ? "e.g. solo creators struggling with invoicing" : "Optional narrowing"}/></label>
            <label>Geography<input name="geography" placeholder="US, UK, Zambia..."/></label>
            <label>Platform
              <select name="platform"><option value="">Any</option><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>X</option><option>LinkedIn</option></select>
            </label>
            <label>Minimum followers<input name="minFollowers" type="number" min="1000" defaultValue={10000}/></label>
            <label className={styles.checkLabel}><input name="excludeProductSellers" type="checkbox" defaultChecked={mode === "AUDIENCE_SCOUT"}/> Prefer creators without equivalent product</label>
            <button className={styles.primaryButton} type="submit" disabled={busy}><Search size={14}/> Queue search</button>
          </form>
          <p className={styles.searchHint}>
            {mode === "AUTO" && "Auto uses lifecycle, product priority, partner coverage, outreach gap and search freshness. New and under-covered products rise first."}
            {mode === "AUDIENCE_SCOUT" && "Audience Scout is pre-product discovery: find strong audiences, repeated pain and creators who could become launch distribution before anything is built."}
            {mode === "PRODUCT" && "Search only for the selected product using its audience, problem, creator niches, keywords and target markets."}
            {mode === "EXPAND" && "Expand deliberately looks beyond the creator pockets already covered for the selected product."}
            {mode === "ALL" && "Queue a distributed search across the strongest current product priorities without treating every product equally."}
          </p>
        </section>

        <section className={styles.stats}>
          <button className={styles.stat} type="button" onClick={() => setTab("coverage")}><span className={styles.statNumber}>{data.products.length}</span><span className={styles.statLabel}>Products</span></button>
          <button className={styles.stat} type="button" onClick={() => setTab("partners")}><span className={styles.statNumber}>{data.prospects.length}</span><span className={styles.statLabel}>Creators</span></button>
          <button className={styles.stat} type="button" onClick={() => setTab("partners")}><span className={styles.statNumber}>{totalPartners}</span><span className={styles.statLabel}>Partners</span></button>
          <button className={styles.stat} type="button" onClick={() => setTab("partners")}><span className={styles.statNumber}>{totalSales}</span><span className={styles.statLabel}>Sales relationships</span></button>
          <button className={styles.stat} type="button" onClick={() => setTab("coverage")}><span className={styles.statNumber}>{compact(totalReach)}</span><span className={styles.statLabel}>Reach mapped</span></button>
          <button className={styles.stat} type="button" onClick={() => setTab("opportunities")}><span className={styles.statNumber}>{data.opportunities.length}</span><span className={styles.statLabel}>Opportunities</span></button>
        </section>

        {message && <p className={styles.message}>{message}</p>}

        <nav className={styles.tabs}>
          {([["partners","Partners"],["coverage","Product Coverage"],["opportunities","Opportunities"],["searches","Search Queue"]] as const).map(([value,label]) =>
            <button key={value} type="button" className={tab === value ? styles.tabActive : styles.tabButton} onClick={() => setTab(value)}>{label}</button>
          )}
        </nav>

        {showAdd && (
          <form className={styles.addPanel} onSubmit={addProspect}>
            <label>Product / scout use<select name="productId" defaultValue={selectedProduct}><option value="">Audience Scout · no product yet</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
            <label>Fit score<input name="fitScore" type="number" min="0" max="100" defaultValue="80"/></label>
            <label>Name<input name="name" placeholder="Creator name"/></label>
            <label>Platform<select name="platform"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>X</option><option>LinkedIn</option></select></label>
            <label>Handle<input name="handle" required placeholder="@creator"/></label>
            <label>Audience size<input name="audienceSize" required type="number" min="10000" placeholder="10000"/></label>
            <label className={styles.full}>Profile URL<input name="profileUrl" type="url" placeholder="Optional if handle maps cleanly"/></label>
            <label>Contact<input name="contact" placeholder="Email / preferred channel"/></label>
            <label>Affiliate link<input name="affiliateLink" placeholder="Tracked link when available"/></label>
            <label className={styles.full}>Audience market<textarea name="audienceMarket" required rows={2} placeholder="Who follows them and where buyers are concentrated."/></label>
            <label className={styles.full}>Recent activity evidence<textarea name="activityEvidence" required rows={2} placeholder="Current posts/videos showing the creator is active."/></label>
            <label className={styles.full}>Buyer-intent evidence<textarea name="buyerIntentEvidence" required rows={2} placeholder="Evidence the audience acts on practical recommendations."/></label>
            <label className={styles.full}>Monetization evidence<textarea name="monetizationEvidence" required rows={2} placeholder="Existing paid resources, sponsors, services or links."/></label>
            <label className={styles.full}>Why this product fits<textarea name="reason" required rows={2}/></label>
            <label className={styles.full}>Current personal hook<textarea name="personalHook" required rows={2}/></label>
            <label className={styles.full}>Personalized outreach<textarea name="outreachMessage" required rows={6}/></label>
            <label className={styles.full}>Notes<textarea name="notes" rows={2}/></label>
            <div className={styles.formActions}><button type="button" className={styles.secondaryButton} onClick={() => setShowAdd(false)}>Cancel</button><button className={styles.primaryButton} disabled={busy}>Save prospect</button></div>
          </form>
        )}

        {tab === "partners" && (
          <>
            <div className={styles.filterBar}>
              <label>Product<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}><option value="">All products</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
              <label>Stage<select value={stage} onChange={(event) => setStage(event.target.value as Stage | "ALL")}><option value="ALL">All stages</option>{stages.map((value) => <option key={value}>{value}</option>)}</select></label>
              {selectedCoverage && <div className={styles.coverageMini}><strong>{selectedCoverage.qualified}</strong> qualified · <strong>{selectedCoverage.partners}</strong> partners · <strong>{compact(selectedCoverage.reachableAudience)}</strong> reach</div>}
            </div>

            {busy && !relationshipCards.length ? <div className={styles.loading}><LoaderCircle className={styles.spin} size={15}/> Loading relationships…</div> :
              relationshipCards.length ? <section className={styles.queue}>
                {relationshipCards.map(({ match, prospect }) => {
                  const product = productById.get(match.product_id);
                  const creatorMatches = data.matches.filter((item) => item.prospect_id === prospect.id);
                  const matchedProducts = creatorMatches
                    .map((item) => productById.get(item.product_id)?.name)
                    .filter(Boolean) as string[];
                  return <article className={styles.card} key={match.id}>
                    <div className={styles.cardGrid}>
                      <div className={styles.identity}>
                        <div className={styles.chips}>
                          <span className={styles.chip}>{prospect.platform}</span>
                          <span className={styles.chip}>{compact(prospect.audience_size)} followers</span>
                          <span className={styles.statusChip}>{pretty(match.status)}</span>
                          <span className={styles.fitChip}>Fit {match.fit_score}/100</span>
                        </div>
                        <h2 className={styles.name}>{prospect.name || `@${prospect.handle}`}</h2>
                        <p className={styles.handle}>@{prospect.handle}</p>
                        <div className={styles.productMatch}><span>Matched product</span><strong>{product?.name || "Unknown product"}</strong><small>{match.commission_rate}% affiliate · Fits: {matchedProducts.join(" · ") || "this product"}</small></div>
                        <p className={styles.reason}>{match.reason || prospect.reason}</p>
                        <p className={styles.hook}><strong>Hook:</strong> {match.personal_hook || prospect.personal_hook}</p>
                        <div className={styles.qualificationGrid}>
                          <div><span>Market</span><p>{prospect.audience_market}</p></div>
                          <div><span>Activity</span><p>{prospect.activity_evidence}</p></div>
                          <div><span>Buying intent</span><p>{prospect.buyer_intent_evidence}</p></div>
                          <div><span>Monetization</span><p>{prospect.monetization_evidence}</p></div>
                        </div>
                        <div className={styles.cardActions}>
                          <a className={styles.openButton} href={prospect.profile_url} target="_blank" rel="noreferrer"><ExternalLink size={13}/> Open profile</a>
                          <button className={styles.copyButton} type="button" onClick={() => void copy(match.outreach_message || prospect.outreach_message)}><Clipboard size={13}/> Copy outreach</button>
                        </div>
                      </div>
                      <div className={styles.messageBox}>
                        <p className={styles.messageTitle}>Product-specific outreach</p>
                        <p className={styles.messageBody}>{match.outreach_message || prospect.outreach_message}</p>
                        <div className={styles.nextAction}><strong>Next action</strong><span>{nextAction(match.status)}</span></div>
                        <div className={styles.performanceStrip}><span>{match.conversions} conversions</span><span>{money(match.revenue_cents)} tracked revenue</span></div>
                      </div>
                    </div>
                    <div className={styles.stageBar}>
                      {stages.map((next) => <button key={next} type="button" className={next === "SALE" ? styles.saleButton : styles.stageButton} disabled={match.status === next || busy} onClick={() => void changeMatchStage(match, next)}>{next === match.status && <Check size={11}/>} {pretty(next)}</button>)}
                      <button type="button" className={styles.deleteButton} onClick={() => void removeProspect(prospect)} aria-label={`Remove @${prospect.handle}`}><Trash2 size={13}/></button>
                    </div>
                  </article>;
                })}
              </section> : <div className={styles.empty}><div className={styles.emptyIcon}><Users size={22}/></div><h2>No relationships in this view.</h2><p>Choose another product/stage or queue a search. Creators live once in the engine and can match multiple products.</p></div>
            }
          </>
        )}

        {tab === "coverage" && (
          <section className={styles.coverageGrid}>
            {data.coverage.map((item) => {
              const product = productById.get(item.productId);
              return <article className={styles.coverageCard} key={item.productId}>
                <div className={styles.coverageHead}><div><span>{pretty(item.lifecycleStatus)}</span><h2>{item.productName}</h2></div><strong>P{product?.priority ?? 50}</strong></div>
                <div className={styles.coverageNumbers}>
                  <div><b>{item.qualified}</b><span>Qualified</span></div>
                  <div><b>{item.contacted}</b><span>Contacted</span></div>
                  <div><b>{item.replied}</b><span>Replies</span></div>
                  <div><b>{item.partners}</b><span>Partners</span></div>
                  <div><b>{item.conversions}</b><span>Conversions</span></div>
                  <div><b>{compact(item.reachableAudience)}</b><span>Reach</span></div>
                </div>
                <p><strong>Covered:</strong> {item.channels.length ? item.channels.join(" · ") : "No channels yet"}</p>
                <p><strong>Channel gaps:</strong> {item.channelGaps.length ? item.channelGaps.join(" · ") : "None across tracked channels"}</p>
                <p><strong>Target geographies:</strong> {item.targetGeographies || "Not set"}</p>
                <p><strong>Observed markets:</strong> {item.markets.length ? item.markets.join(" · ") : "No audience-market evidence yet"}</p>
                <div className={styles.coverageActions}>
                  <button type="button" onClick={() => { setSelectedProduct(item.productId); setMode("PRODUCT"); setTab("partners"); }}>Open partners</button>
                  <button type="button" onClick={() => { setSelectedProduct(item.productId); setMode("EXPAND"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Expand search</button>
                </div>
              </article>;
            })}
            {!data.coverage.length && <div className={styles.noResults}>No products are registered yet. Add products in Marketplace Manage first.</div>}
          </section>
        )}

        {tab === "opportunities" && (
          <>
            <div className={styles.sectionToolbar}>
              <div><p className={styles.eyebrow}>BUILD AFTER DISTRIBUTION</p><h2>Audience opportunities</h2></div>
              <button className={styles.primaryButton} type="button" onClick={() => setShowOpportunity((value) => !value)}><Plus size={14}/> Add opportunity</button>
            </div>
            {showOpportunity && <form className={styles.addPanel} onSubmit={addOpportunity}>
              <label>Opportunity title<input name="title" required placeholder="Creator bookkeeping pain"/></label>
              <label>Niche<input name="niche" placeholder="Creator finance"/></label>
              <label className={styles.full}>Repeated audience problem<textarea name="audienceProblem" required rows={3}/></label>
              <label className={styles.full}>Creator / content signals<textarea name="creatorSignals" rows={3} placeholder="Who has the audience, what keeps recurring, strong posts/videos."/></label>
              <label>Audience market<input name="audienceMarket" placeholder="US / UK creator economy"/></label>
              <label>Saturation<input name="saturation" placeholder="Low / medium / crowded + evidence"/></label>
              <label>Creators observed<input name="creatorCount" type="number" min="0"/></label>
              <label>Estimated reachable audience<input name="estimatedReach" type="number" min="0"/></label>
              <label className={styles.full}>Notes<textarea name="notes" rows={2}/></label>
              <div className={styles.formActions}><button type="button" className={styles.secondaryButton} onClick={() => setShowOpportunity(false)}>Cancel</button><button className={styles.primaryButton} disabled={busy}>Save opportunity</button></div>
            </form>}
            <section className={styles.opportunityGrid}>
              {data.opportunities.map((item) => {
                const creatorLinks = data.opportunityCreators.filter((link) => link.opportunity_id === item.id);
                const linkedCreatorIds = new Set(creatorLinks.map((link) => link.prospect_id));
                const availableCreators = data.prospects.filter((prospect) => !linkedCreatorIds.has(prospect.id));
                return <article className={styles.opportunityCard} key={item.id}>
                <div className={styles.opportunityHead}><span>{pretty(item.status)}</span><button type="button" onClick={() => void removeOpportunity(item)}><Trash2 size={13}/></button></div>
                <h2>{item.title}</h2><p className={styles.opportunityProblem}>{item.audience_problem}</p>
                <div className={styles.opportunityMeta}><span>{item.niche || "Unspecified niche"}</span><span>{item.creator_count} creators</span><span>{compact(item.estimated_reach)} reach</span></div>
                {item.creator_signals && <p><strong>Signals:</strong> {item.creator_signals}</p>}
                {item.audience_market && <p><strong>Market:</strong> {item.audience_market}</p>}
                {item.saturation && <p><strong>Saturation:</strong> {item.saturation}</p>}
                <div className={styles.opportunityLink}>
                  <a href="/manage?mode=add" target="_blank" rel="noreferrer"><Plus size={12}/> Create product</a>
                  <select value={item.linked_product_id || ""} onChange={(event) => void linkOpportunity(item, event.target.value)} disabled={busy}>
                    <option value="">Not linked to a product</option>
                    {data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </div>
                <div className={styles.scoutCreators}>
                  <strong>Audience creators</strong>
                  <div className={styles.scoutCreatorList}>
                    {creatorLinks.map((link) => {
                      const creator = prospectById.get(link.prospect_id);
                      return creator ? <span key={link.id}><a href={creator.profile_url} target="_blank" rel="noreferrer">@{creator.handle}</a><button type="button" onClick={() => void unlinkOpportunityCreator(item, creator.id)} aria-label={`Unlink @${creator.handle}`}>×</button></span> : null;
                    })}
                    {!creatorLinks.length && <em>No creators linked yet.</em>}
                  </div>
                  <select value="" onChange={(event) => void linkOpportunityCreator(item, event.target.value)} disabled={busy || !availableCreators.length}>
                    <option value="">Link a researched creator…</option>
                    {availableCreators.map((creator) => <option key={creator.id} value={creator.id}>@{creator.handle} · {creator.platform} · {compact(creator.audience_size)}</option>)}
                  </select>
                </div>
                <select value={item.status} onChange={(event) => void moveOpportunity(item, event.target.value)} disabled={busy}>{opportunityStages.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select>
              </article>;
              })}
              {!data.opportunities.length && <div className={styles.empty}><div className={styles.emptyIcon}><Radar size={22}/></div><h2>No audience opportunities yet.</h2><p>Run Audience Scout or add one from research. The goal is to know the audience and likely distribution before building the next product.</p></div>}
            </section>
          </>
        )}

        {tab === "searches" && (
          <section className={styles.searchQueue}>
            {data.searchRuns.map((run) => {
              const product = productById.get(run.product_id);
              return <article className={styles.searchRun} key={run.id}>
                <div className={styles.searchRunHead}><span>{pretty(run.mode)}</span><strong className={styles[`run${pretty(run.status).replaceAll(" ", "")}`] || ""}>{run.status}</strong></div>
                <h2>{run.mode === "AUDIENCE_SCOUT" ? (run.niche || "Audience discovery") : (product?.name || "Product search")}</h2>
                <p>{run.query_brief}</p>
                <div className={styles.searchRunMeta}><span>{run.platform || "Any platform"}</span><span>{run.geography || "Any geography"}</span><span>{compact(run.min_followers)}+ followers</span>{run.exclude_product_sellers ? <span>Exclude equivalent sellers</span> : null}</div>
              </article>;
            })}
            {!data.searchRuns.length && <div className={styles.empty}><div className={styles.emptyIcon}><Search size={22}/></div><h2>No search jobs yet.</h2><p>Use the command panel above to queue Product, Auto, Audience Scout, Expand or All Products search work.</p></div>}
          </section>
        )}

        <footer className={styles.footerNote}>
          <span><strong>GOLIDE Partner Engine</strong> · product-aware distribution workspace</span>
          <span>Audience → Product → Partners → Launch → Coverage</span>
        </footer>
      </div>
    </main>
  );
}
