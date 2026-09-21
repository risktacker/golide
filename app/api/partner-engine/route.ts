import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getGolideUser, isAdminUser } from "../../chatgpt-auth";
import { ensureMarketTable } from "../../ventures/market-systems/market-data";

const PIPELINE = ["NEW", "CONTACTED", "REPLIED", "PARTNER", "SALE", "NO_REPLY"] as const;
const MODES = ["PRODUCT", "AUTO", "AUDIENCE_SCOUT", "EXPAND", "ALL"] as const;
type PipelineStatus = (typeof PIPELINE)[number];
type SearchMode = (typeof MODES)[number];

function clean(value: unknown, max = 1200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function integer(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}
function status(value: unknown): PipelineStatus | null {
  const result = clean(value, 30).toUpperCase();
  return PIPELINE.includes(result as PipelineStatus) ? result as PipelineStatus : null;
}
function mode(value: unknown): SearchMode | null {
  const result = clean(value, 30).toUpperCase();
  return MODES.includes(result as SearchMode) ? result as SearchMode : null;
}
function profileUrl(platform: string, handle: string) {
  const h = handle.replace(/^@/, "");
  const p = platform.toLowerCase();
  if (p === "instagram") return `https://www.instagram.com/${encodeURIComponent(h)}/`;
  if (p === "tiktok") return `https://www.tiktok.com/@${encodeURIComponent(h)}`;
  if (p === "youtube") return `https://www.youtube.com/@${encodeURIComponent(h)}`;
  if (p === "x" || p === "twitter") return `https://x.com/${encodeURIComponent(h)}`;
  return "";
}

async function ensureInfrastructure() {
  if (!env.DB) throw new Error("Partner database is unavailable.");
  await ensureMarketTable();
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS partner_prospects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      platform TEXT NOT NULL,
      handle TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      contact TEXT NOT NULL DEFAULT '',
      audience_size INTEGER NOT NULL DEFAULT 0,
      audience_market TEXT NOT NULL DEFAULT '',
      activity_evidence TEXT NOT NULL DEFAULT '',
      buyer_intent_evidence TEXT NOT NULL DEFAULT '',
      monetization_evidence TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      personal_hook TEXT NOT NULL DEFAULT '',
      outreach_message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'NEW',
      affiliate_link TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      last_contacted_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS partner_prospects_platform_handle_idx ON partner_prospects (platform, handle)").run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS partner_product_matches (
      id TEXT PRIMARY KEY NOT NULL,
      prospect_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      fit_score INTEGER NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      personal_hook TEXT NOT NULL DEFAULT '',
      outreach_message TEXT NOT NULL DEFAULT '',
      commission_rate INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'NEW',
      conversions INTEGER NOT NULL DEFAULT 0,
      revenue_cents INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(prospect_id, product_id)
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS partner_product_matches_product_idx ON partner_product_matches (product_id, status, updated_at)").run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS audience_opportunities (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      niche TEXT NOT NULL DEFAULT '',
      audience_problem TEXT NOT NULL DEFAULT '',
      creator_signals TEXT NOT NULL DEFAULT '',
      audience_market TEXT NOT NULL DEFAULT '',
      creator_count INTEGER NOT NULL DEFAULT 0,
      estimated_reach INTEGER NOT NULL DEFAULT 0,
      saturation TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'AUDIENCE_OPPORTUNITY',
      linked_product_id TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS partner_search_runs (
      id TEXT PRIMARY KEY NOT NULL,
      mode TEXT NOT NULL,
      product_id TEXT NOT NULL DEFAULT '',
      niche TEXT NOT NULL DEFAULT '',
      geography TEXT NOT NULL DEFAULT '',
      platform TEXT NOT NULL DEFAULT '',
      min_followers INTEGER NOT NULL DEFAULT 10000,
      exclude_product_sellers INTEGER NOT NULL DEFAULT 0,
      query_brief TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'QUEUED',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS partner_search_runs_status_idx ON partner_search_runs (status, created_at)").run();
}

async function rows<T = Record<string, unknown>>(sql: string, binds: unknown[] = []) {
  let statement = env.DB.prepare(sql);
  if (binds.length) statement = statement.bind(...binds);
  const result = await statement.all<T>();
  return result.results ?? [];
}

type ProductRow = {
  id: string; slug: string; name: string; shelf: string; lifecycle_status: string;
  target_audience: string; problem_solved: string; keywords: string; creator_niches: string;
  target_geographies: string; affiliate_rate: number; launch_date: string; priority: number;
  last_partner_search_at: number | null; published: number; updated_at: number;
};

async function snapshot() {
  const [products, prospects, matches, opportunities, searchRuns] = await Promise.all([
    rows<ProductRow>(`SELECT id, slug, name, shelf, lifecycle_status, target_audience, problem_solved,
      keywords, creator_niches, target_geographies, affiliate_rate, launch_date, priority,
      last_partner_search_at, published, updated_at FROM market_products ORDER BY priority DESC, updated_at DESC`),
    rows(`SELECT * FROM partner_prospects ORDER BY updated_at DESC`),
    rows(`SELECT * FROM partner_product_matches ORDER BY updated_at DESC`),
    rows(`SELECT * FROM audience_opportunities ORDER BY updated_at DESC`),
    rows(`SELECT * FROM partner_search_runs ORDER BY created_at DESC LIMIT 60`),
  ]);

  const prospectById = new Map(prospects.map((item: any) => [item.id, item]));
  const matchesByProduct = new Map<string, any[]>();
  for (const item of matches as any[]) {
    const list = matchesByProduct.get(item.product_id) ?? [];
    list.push(item);
    matchesByProduct.set(item.product_id, list);
  }
  const coverage = products.map((product) => {
    const productMatches = matchesByProduct.get(product.id) ?? [];
    const uniqueProspects = [...new Set(productMatches.map((item) => item.prospect_id))];
    const platforms = new Set<string>();
    let reachableAudience = 0;
    uniqueProspects.forEach((id) => {
      const prospect: any = prospectById.get(id);
      if (prospect) {
        reachableAudience += Number(prospect.audience_size || 0);
        if (prospect.platform) platforms.add(String(prospect.platform));
      }
    });
    const count = (s: string) => productMatches.filter((item) => item.status === s).length;
    return {
      productId: product.id,
      productName: product.name,
      lifecycleStatus: product.lifecycle_status,
      qualified: productMatches.length,
      contacted: count("CONTACTED"),
      replied: count("REPLIED"),
      partners: count("PARTNER"),
      sales: count("SALE"),
      conversions: productMatches.reduce((sum, item) => sum + Number(item.conversions || 0), 0),
      revenueCents: productMatches.reduce((sum, item) => sum + Number(item.revenue_cents || 0), 0),
      reachableAudience,
      channels: [...platforms],
    };
  });
  return { products, prospects, matches, opportunities, searchRuns, coverage };
}

function lifecycleBoost(value: string) {
  return ({ IDEA: 50, PRE_LAUNCH: 75, NEW: 100, ACTIVE: 55, MATURE: 20, PAUSED: 0 } as Record<string, number>)[value] ?? 40;
}

function productSearchScore(product: ProductRow, matchCount: number, contactedCount: number) {
  const last = product.last_partner_search_at || 0;
  const daysSince = last ? Math.min(45, Math.floor((Date.now() - last) / 86400000)) : 45;
  const coverageGap = Math.max(0, 40 - matchCount) * 2;
  const outreachGap = Math.max(0, 15 - contactedCount);
  return lifecycleBoost(product.lifecycle_status) + product.priority + coverageGap + outreachGap + daysSince;
}

async function chooseProducts(requestedMode: SearchMode, selectedProductId: string) {
  const snap = await snapshot();
  const products = snap.products as ProductRow[];
  const coverageMap = new Map(snap.coverage.map((item: any) => [item.productId, item]));
  if (requestedMode === "PRODUCT" || requestedMode === "EXPAND") {
    const selected = products.find((item) => item.id === selectedProductId);
    if (!selected) throw new Error("Choose a valid product.");
    return [selected];
  }
  const candidates = products
    .filter((item) => item.lifecycle_status !== "PAUSED")
    .map((item) => {
      const coverage: any = coverageMap.get(item.id) ?? {};
      return { item, score: productSearchScore(item, Number(coverage.qualified || 0), Number(coverage.contacted || 0)) + Math.random() * 12 };
    })
    .sort((a, b) => b.score - a.score);
  if (requestedMode === "ALL") return candidates.slice(0, Math.min(8, candidates.length)).map((item) => item.item);
  return candidates.slice(0, 1).map((item) => item.item);
}

function queryBrief(product: ProductRow | null, body: Record<string, unknown>, requestedMode: SearchMode) {
  const niche = clean(body.niche, 500);
  const geography = clean(body.geography, 300);
  const platform = clean(body.platform, 100);
  if (requestedMode === "AUDIENCE_SCOUT") {
    return [
      "Pre-product audience discovery.",
      niche ? `Niche: ${niche}.` : "Find a commercially coherent audience cluster.",
      geography ? `Geography: ${geography}.` : "",
      platform ? `Platform: ${platform}.` : "",
      "Prioritize active creators with meaningful followings whose audience has repeated practical problems.",
      "Prefer creators who do not already sell the equivalent digital product; capture recurring pain points and build-partner potential.",
    ].filter(Boolean).join(" ");
  }
  if (!product) return "";
  return [
    `Product: ${product.name}.`,
    product.target_audience ? `Audience: ${product.target_audience}.` : "",
    product.problem_solved ? `Problem: ${product.problem_solved}.` : "",
    product.creator_niches ? `Creator niches: ${product.creator_niches}.` : "",
    product.keywords ? `Keywords: ${product.keywords}.` : "",
    geography || product.target_geographies ? `Geography: ${geography || product.target_geographies}.` : "",
    platform ? `Platform: ${platform}.` : "",
    requestedMode === "EXPAND" ? "Expand beyond already-covered creator pockets without duplicating existing prospects." : "",
    "Prioritize current activity, audience buying intent and monetization evidence. Do not re-add an existing platform/handle.",
  ].filter(Boolean).join(" ");
}

export async function POST(request: Request) {
  const user = await getGolideUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await ensureInfrastructure();
  const action = clean(body.action, 40);

  if (action === "snapshot") return NextResponse.json(await snapshot());

  if (action === "create-prospect") {
    const prospect = (body.prospect ?? {}) as Record<string, unknown>;
    const platform = clean(prospect.platform, 60) || "Instagram";
    const handle = clean(prospect.handle, 160).replace(/^@/, "");
    const productId = clean(body.productId, 80);
    const audienceSize = integer(prospect.audienceSize);
    if (!handle || audienceSize < 10000) return NextResponse.json({ error: "A handle and normally at least 10,000 followers are required." }, { status: 400 });
    const product = productId ? (await rows<ProductRow>("SELECT * FROM market_products WHERE id=? LIMIT 1", [productId]))[0] : null;
    if (productId && !product) return NextResponse.json({ error: "Choose a valid product." }, { status: 400 });
    const required = ["audienceMarket", "activityEvidence", "buyerIntentEvidence", "monetizationEvidence", "reason", "personalHook", "outreachMessage"];
    if (required.some((key) => !clean(prospect[key], key === "outreachMessage" ? 5000 : 1200))) {
      return NextResponse.json({ error: "Audience, activity, buying intent, monetization, fit, hook and personalized outreach evidence are required." }, { status: 400 });
    }
    const existing = await rows<any>("SELECT id FROM partner_prospects WHERE lower(platform)=lower(?) AND lower(handle)=lower(?) LIMIT 1", [platform, handle]);
    const now = Date.now();
    const prospectId = existing[0]?.id || crypto.randomUUID();
    if (!existing.length) {
      await env.DB.prepare(`INSERT INTO partner_prospects
        (id,name,platform,handle,profile_url,contact,audience_size,audience_market,activity_evidence,buyer_intent_evidence,monetization_evidence,reason,personal_hook,outreach_message,status,affiliate_link,notes,last_contacted_at,created_at,updated_at)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,'NEW',?15,?16,NULL,?17,?18)`)
        .bind(prospectId, clean(prospect.name, 160), platform, handle, clean(prospect.profileUrl, 1200) || profileUrl(platform, handle), clean(prospect.contact, 300), audienceSize,
          clean(prospect.audienceMarket), clean(prospect.activityEvidence), clean(prospect.buyerIntentEvidence), clean(prospect.monetizationEvidence), clean(prospect.reason),
          clean(prospect.personalHook), clean(prospect.outreachMessage, 5000), clean(prospect.affiliateLink, 1200), clean(prospect.notes, 2000), now, now).run();
    }
    if (product) {
      await env.DB.prepare(`INSERT INTO partner_product_matches
        (id,prospect_id,product_id,fit_score,reason,personal_hook,outreach_message,commission_rate,status,conversions,revenue_cents,created_at,updated_at)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,'NEW',0,0,?9,?10)
        ON CONFLICT(prospect_id,product_id) DO UPDATE SET fit_score=excluded.fit_score,reason=excluded.reason,personal_hook=excluded.personal_hook,outreach_message=excluded.outreach_message,commission_rate=excluded.commission_rate,updated_at=excluded.updated_at`)
        .bind(crypto.randomUUID(), prospectId, product.id, Math.max(0, Math.min(100, integer(prospect.fitScore, 80))), clean(prospect.reason), clean(prospect.personalHook),
          clean(prospect.outreachMessage, 5000), integer(product.affiliate_rate, 0), now, now).run();
    }
    return NextResponse.json({ ok: true, prospectId });
  }

  if (action === "link-product") {
    const prospectId = clean(body.prospectId, 80);
    const productId = clean(body.productId, 80);
    const now = Date.now();
    const product = (await rows<ProductRow>("SELECT * FROM market_products WHERE id=? LIMIT 1", [productId]))[0];
    if (!prospectId || !product) return NextResponse.json({ error: "Prospect and product are required." }, { status: 400 });
    await env.DB.prepare(`INSERT INTO partner_product_matches
      (id,prospect_id,product_id,fit_score,reason,personal_hook,outreach_message,commission_rate,status,conversions,revenue_cents,created_at,updated_at)
      VALUES (?1,?2,?3,?4,?5,?6,?7,?8,'NEW',0,0,?9,?10)
      ON CONFLICT(prospect_id,product_id) DO UPDATE SET fit_score=excluded.fit_score,reason=excluded.reason,personal_hook=excluded.personal_hook,outreach_message=excluded.outreach_message,commission_rate=excluded.commission_rate,updated_at=excluded.updated_at`)
      .bind(crypto.randomUUID(), prospectId, productId, Math.max(0, Math.min(100, integer(body.fitScore, 70))), clean(body.reason), clean(body.personalHook), clean(body.outreachMessage, 5000), product.affiliate_rate || 0, now, now).run();
    return NextResponse.json({ ok: true });
  }

  if (action === "match-status") {
    const id = clean(body.id, 80);
    const next = status(body.status);
    if (!id || !next) return NextResponse.json({ error: "Valid relationship and status are required." }, { status: 400 });
    await env.DB.prepare("UPDATE partner_product_matches SET status=?1, updated_at=?2 WHERE id=?3").bind(next, Date.now(), id).run();
    if (next === "CONTACTED") {
      const match = (await rows<any>("SELECT prospect_id FROM partner_product_matches WHERE id=? LIMIT 1", [id]))[0];
      if (match) await env.DB.prepare("UPDATE partner_prospects SET status='CONTACTED', last_contacted_at=?1, updated_at=?2 WHERE id=?3").bind(Date.now(), Date.now(), match.prospect_id).run();
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "delete-prospect") {
    const id = clean(body.id, 80);
    if (!id) return NextResponse.json({ error: "Missing prospect." }, { status: 400 });
    await env.DB.batch([
      env.DB.prepare("DELETE FROM partner_product_matches WHERE prospect_id=?1").bind(id),
      env.DB.prepare("DELETE FROM partner_prospects WHERE id=?1").bind(id),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action === "opportunity-create") {
    const item = (body.opportunity ?? {}) as Record<string, unknown>;
    const title = clean(item.title, 180);
    const problem = clean(item.audienceProblem, 1600);
    if (!title || !problem) return NextResponse.json({ error: "Opportunity title and audience problem are required." }, { status: 400 });
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO audience_opportunities
      (id,title,niche,audience_problem,creator_signals,audience_market,creator_count,estimated_reach,saturation,status,linked_product_id,notes,created_at,updated_at)
      VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'AUDIENCE_OPPORTUNITY','',?10,?11,?12)`)
      .bind(crypto.randomUUID(), title, clean(item.niche, 600), problem, clean(item.creatorSignals, 1800), clean(item.audienceMarket, 800),
        Math.max(0, integer(item.creatorCount)), Math.max(0, integer(item.estimatedReach)), clean(item.saturation, 300), clean(item.notes, 2200), now, now).run();
    return NextResponse.json({ ok: true });
  }

  if (action === "opportunity-status") {
    const id = clean(body.id, 80);
    const next = clean(body.status, 40).toUpperCase();
    const allowed = ["AUDIENCE_OPPORTUNITY", "PROPOSED_PRODUCT", "PRE_LAUNCH", "PRODUCT_CREATED", "PARTNER_RECRUITMENT", "LAUNCH", "ACTIVE", "MATURE", "PAUSED"];
    if (!id || !allowed.includes(next)) return NextResponse.json({ error: "Invalid opportunity lifecycle." }, { status: 400 });
    await env.DB.prepare("UPDATE audience_opportunities SET status=?1, updated_at=?2 WHERE id=?3").bind(next, Date.now(), id).run();
    return NextResponse.json({ ok: true });
  }

  if (action === "opportunity-delete") {
    const id = clean(body.id, 80);
    if (id) await env.DB.prepare("DELETE FROM audience_opportunities WHERE id=?1").bind(id).run();
    return NextResponse.json({ ok: true });
  }

  if (action === "search") {
    const requestedMode = mode(body.mode);
    if (!requestedMode) return NextResponse.json({ error: "Choose a valid search mode." }, { status: 400 });
    const minFollowers = Math.max(1000, integer(body.minFollowers, 10000));
    const now = Date.now();
    const created: string[] = [];
    if (requestedMode === "AUDIENCE_SCOUT") {
      const id = crypto.randomUUID();
      await env.DB.prepare(`INSERT INTO partner_search_runs
        (id,mode,product_id,niche,geography,platform,min_followers,exclude_product_sellers,query_brief,status,created_at,updated_at)
        VALUES (?1,'AUDIENCE_SCOUT','',?2,?3,?4,?5,1,?6,'QUEUED',?7,?8)`)
        .bind(id, clean(body.niche, 500), clean(body.geography, 300), clean(body.platform, 100), minFollowers, queryBrief(null, body, requestedMode), now, now).run();
      created.push(id);
    } else {
      const chosen = await chooseProducts(requestedMode, clean(body.productId, 80));
      if (!chosen.length) return NextResponse.json({ error: "No eligible products are available." }, { status: 400 });
      for (const product of chosen) {
        const id = crypto.randomUUID();
        await env.DB.prepare(`INSERT INTO partner_search_runs
          (id,mode,product_id,niche,geography,platform,min_followers,exclude_product_sellers,query_brief,status,created_at,updated_at)
          VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'QUEUED',?10,?11)`)
          .bind(id, requestedMode, product.id, clean(body.niche, 500), clean(body.geography, 300), clean(body.platform, 100), minFollowers,
            body.excludeProductSellers ? 1 : 0, queryBrief(product, body, requestedMode), now, now).run();
        await env.DB.prepare("UPDATE market_products SET last_partner_search_at=?1 WHERE id=?2").bind(now, product.id).run();
        created.push(id);
      }
    }
    return NextResponse.json({ ok: true, queued: created.length, ids: created });
  }

  if (action === "search-status") {
    const id = clean(body.id, 80);
    const next = clean(body.status, 30).toUpperCase();
    if (!["QUEUED", "RUNNING", "DONE", "FAILED"].includes(next)) return NextResponse.json({ error: "Invalid search status." }, { status: 400 });
    await env.DB.prepare("UPDATE partner_search_runs SET status=?1, updated_at=?2 WHERE id=?3").bind(next, Date.now(), id).run();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
