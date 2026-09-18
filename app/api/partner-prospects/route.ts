import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { partnerProspects } from "../../../db/schema";
import { getGolideUser, isAdminUser } from "../../chatgpt-auth";

const STATUSES = ["NEW", "CONTACTED", "REPLIED", "PARTNER", "SALE", "NO_REPLY"] as const;
type PartnerStatus = (typeof STATUSES)[number];

const STARTER_PROSPECTS = [
  { name: "Caitlin", platform: "Instagram", handle: "yourstoryunwritten", audienceSize: 1800, reason: "Job-search and interview content with a focused early-stage audience.", hook: "your interview-prep and job-search content" },
  { name: "Cynthia", platform: "Instagram", handle: "yourhrbigsiscynthia", audienceSize: 3800, reason: "HR-led job-search strategy content aimed directly at candidates.", hook: "your practical HR and job-search strategy posts" },
  { name: "Simi Awokoya", platform: "Instagram", handle: "coachsimi", audienceSize: 2900, reason: "Career coaching and job-search support overlap directly with the product.", hook: "your job-search coaching content" },
  { name: "Katie Jeyn Romeyn", platform: "Instagram", handle: "katiejeyn_", audienceSize: 3600, reason: "Career-focused nano creator with a relevant audience.", hook: "your career-focused content" },
  { name: "Dana Kocane", platform: "Instagram", handle: "dana.kocane", audienceSize: 2400, reason: "HR and career-consultation audience with strong product fit.", hook: "your career consultation and HR content" },
  { name: "Laresa Acevedo", platform: "Instagram", handle: "laresa_ace_empowerment", audienceSize: 1500, reason: "Career coaching, LinkedIn optimization and interview preparation.", hook: "your interview-prep and LinkedIn guidance" },
  { name: "Monalisa Chati", platform: "Instagram", handle: "broncomona", audienceSize: 1300, reason: "Job-search, career and internship advice for active candidates.", hook: "your job-search and internship advice" },
  { name: "Nishant Sarawgi", platform: "Instagram", handle: "careerswithnishant", audienceSize: 10000, reason: "Job-search strategist with direct overlap with GOLIDE's target customer.", hook: "your job-search strategy content" },
  { name: "Rachel Hall", platform: "Instagram", handle: "rachelhallmotivates", audienceSize: 12700, reason: "Career coach focused on job-search strategy.", hook: "your job-search strategy posts" },
  { name: "Irina Posan", platform: "Instagram", handle: "careercoachirina", audienceSize: 18000, reason: "Career coach with an established career-focused audience.", hook: "your career coaching content" },
  { name: "Danielle Bradley", platform: "Instagram", handle: "coachwithdanielle", audienceSize: 22000, reason: "Helps professionals get hired and reaches an audience already trying to convert applications.", hook: "your content helping professionals get hired" },
  { name: "Tega Edwin", platform: "Instagram", handle: "hercareerdoctor", audienceSize: 19700, reason: "Career-transition and job-search audience with strong buyer overlap.", hook: "your career-transition and job-search content" },
] as const;

function cleanText(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanInt(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

function safeUrl(value: unknown) {
  const raw = cleanText(value, 1200);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function validStatus(value: unknown): PartnerStatus | null {
  const status = cleanText(value, 30).toUpperCase();
  return STATUSES.includes(status as PartnerStatus) ? (status as PartnerStatus) : null;
}

function defaultProfileUrl(platform: string, handle: string) {
  const cleanHandle = handle.replace(/^@/, "");
  if (platform.toLowerCase() === "instagram") return `https://www.instagram.com/${encodeURIComponent(cleanHandle)}/`;
  if (platform.toLowerCase() === "tiktok") return `https://www.tiktok.com/@${encodeURIComponent(cleanHandle)}`;
  return "";
}

function defaultMessage(name: string, platform: string, hook: string) {
  const firstName = name.split(/\s+/)[0] || "there";
  const context = hook ? `, especially ${hook}` : "";
  return `Hey ${firstName} — I came across your ${platform} content${context}. I run GOLIDE, and we've built a $19.99 Job Search Conversion System for people who are applying but struggling to turn applications into interviews.

I'm putting together a small group of founding partners whose audiences already include job seekers. There's no fee or paid promotion required from you. I'll give you full access to review it first, your own tracked affiliate link, and ready-made content/assets so you don't have to create the promotion from scratch.

You earn 50% of every sale you refer. I don't want you promoting something you haven't seen, so I'm happy to give you the full product first. Interested?`;
}

async function ensurePartnerTable() {
  if (!env.DB) throw new Error("Partner database is unavailable.");
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS partner_prospects (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      platform TEXT NOT NULL,
      handle TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      contact TEXT NOT NULL DEFAULT '',
      audience_size INTEGER NOT NULL DEFAULT 0,
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
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS partner_prospects_status_idx ON partner_prospects (status, updated_at)").run();
}

export async function POST(request: Request) {
  const user = await getGolideUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid partner request." }, { status: 400 });

  await ensurePartnerTable();
  const db = getDb();
  const action = cleanText(body.action, 30);

  if (action === "list") {
    const prospects = await db.select().from(partnerProspects).orderBy(desc(partnerProspects.updatedAt));
    return NextResponse.json({ prospects });
  }

  if (action === "seed") {
    const now = Date.now();
    const statements = STARTER_PROSPECTS.map((prospect, index) => {
      const handle = prospect.handle.replace(/^@/, "");
      const profileUrl = defaultProfileUrl(prospect.platform, handle);
      return env.DB.prepare(`
        INSERT OR IGNORE INTO partner_prospects
        (id, name, platform, handle, profile_url, contact, audience_size, reason, personal_hook, outreach_message, status, affiliate_link, notes, last_contacted_at, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, '', ?6, ?7, ?8, ?9, 'NEW', '', 'Starter lead. Re-check the latest post before sending.', NULL, ?10, ?11)
      `).bind(
        crypto.randomUUID(),
        prospect.name,
        prospect.platform,
        handle,
        profileUrl,
        prospect.audienceSize,
        prospect.reason,
        prospect.hook,
        defaultMessage(prospect.name, prospect.platform, prospect.hook),
        now + index,
        now + index,
      );
    });
    if (statements.length) await env.DB.batch(statements);
    const prospects = await db.select().from(partnerProspects).orderBy(desc(partnerProspects.updatedAt));
    return NextResponse.json({ ok: true, prospects });
  }

  if (action === "create") {
    const prospect = (body.prospect ?? {}) as Record<string, unknown>;
    const platform = cleanText(prospect.platform, 40) || "Instagram";
    const handle = cleanText(prospect.handle, 120).replace(/^@/, "");
    const name = cleanText(prospect.name, 120);
    const hook = cleanText(prospect.personalHook, 500);
    const reason = cleanText(prospect.reason, 700);
    const profileUrl = safeUrl(prospect.profileUrl) || defaultProfileUrl(platform, handle);
    if (!handle || !profileUrl) return NextResponse.json({ error: "Handle and valid profile URL are required." }, { status: 400 });

    const now = Date.now();
    try {
      await db.insert(partnerProspects).values({
        id: crypto.randomUUID(),
        name,
        platform,
        handle,
        profileUrl,
        contact: cleanText(prospect.contact, 240),
        audienceSize: cleanInt(prospect.audienceSize),
        reason,
        personalHook: hook,
        outreachMessage: cleanText(prospect.outreachMessage, 4000) || defaultMessage(name, platform, hook),
        status: "NEW",
        affiliateLink: cleanText(prospect.affiliateLink, 1200),
        notes: cleanText(prospect.notes, 2000),
        lastContactedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      return NextResponse.json({ error: "That platform and handle are already in the queue." }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "status") {
    const id = cleanText(body.id, 80);
    const status = validStatus(body.status);
    if (!id || !status) return NextResponse.json({ error: "Valid prospect and status are required." }, { status: 400 });
    const now = Date.now();
    await db.update(partnerProspects).set({
      status,
      updatedAt: now,
      ...(status === "CONTACTED" ? { lastContactedAt: now } : {}),
    }).where(eq(partnerProspects.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const id = cleanText(body.id, 80);
    const prospect = (body.prospect ?? {}) as Record<string, unknown>;
    if (!id) return NextResponse.json({ error: "Missing prospect id." }, { status: 400 });
    await db.update(partnerProspects).set({
      name: cleanText(prospect.name, 120),
      contact: cleanText(prospect.contact, 240),
      audienceSize: cleanInt(prospect.audienceSize),
      reason: cleanText(prospect.reason, 700),
      personalHook: cleanText(prospect.personalHook, 500),
      outreachMessage: cleanText(prospect.outreachMessage, 4000),
      affiliateLink: cleanText(prospect.affiliateLink, 1200),
      notes: cleanText(prospect.notes, 2000),
      updatedAt: Date.now(),
    }).where(eq(partnerProspects.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const id = cleanText(body.id, 80);
    if (!id) return NextResponse.json({ error: "Missing prospect id." }, { status: 400 });
    await db.delete(partnerProspects).where(eq(partnerProspects.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
