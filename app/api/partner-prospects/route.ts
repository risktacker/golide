import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { partnerProspects } from "../../../db/schema";
import { getGolideUser, isAdminUser } from "../../chatgpt-auth";

const STATUSES = ["NEW", "CONTACTED", "REPLIED", "PARTNER", "SALE", "NO_REPLY"] as const;
type PartnerStatus = (typeof STATUSES)[number];

const STARTER_PROSPECTS = [
  {
    name: "Krista Witherspoon",
    platform: "Instagram",
    handle: "thee.coachkris",
    audienceSize: 147100,
    reason: "Active career strategist and coach with a large audience around career moves, positioning, income and jobseeker resources.",
    hook: "your September 3 post about using discomfort at work as data, expanding your network and visibility, plus the jobseeker templates and interview resources you already offer",
    message: `Hey Krista — I saw your September 3 post about treating discomfort at work as data and expanding your network, visibility and options instead of shrinking. I also noticed you already give your audience jobseeker templates, resume support and interview resources.

I run GOLIDE, and we've built a $19.99 Job Search Conversion System for people who are applying but not turning enough applications into interviews. The overlap with the people you already help is strong.

I'm inviting a very small group of founding partners. You'd get the full product free to review first, your own tracked Whop link, and ready-made creative assets if you want them. The affiliate commission is 80% of every sale you refer.

I don't want you promoting anything you haven't inspected yourself. If the system looks useful for your audience after you review it, would you be open to testing it with them?`,
  },
  {
    name: "Irina Posan",
    platform: "Instagram",
    handle: "careercoachirina",
    audienceSize: 18065,
    reason: "Active career coach whose content directly addresses applicants getting no traction, resumes, interviews and job-search strategy.",
    hook: "your recent content for HR professionals who are applying to jobs but not hearing back, where you focus on resume, interview and overall job-search strategy",
    message: `Hey Irina — your recent content for HR professionals who are applying but not hearing back caught my attention, especially the way you frame the problem as strategy across the resume, interview and overall search rather than simply sending more applications.

That's very close to what we're building at GOLIDE. Our $19.99 Job Search Conversion System is designed for job seekers who are applying but struggling to convert those applications into interviews.

I'm putting together a small founding-partner group. I'd give you the complete product free to inspect first, a tracked Whop link, and ready-made promo assets if useful. The affiliate commission is 80% per referred sale.

Because your audience already deals with exactly this problem, I'd rather have you review it critically first than ask you to promote blindly. Interested in taking a look?`,
  },
  {
    name: "Nishant Sarawgi",
    platform: "Instagram",
    handle: "careerswithnishant",
    audienceSize: 10074,
    reason: "Active job-search strategist whose current resources surface real openings, interview help and job-search guidance to people actively looking for work.",
    hook: "the stream of current openings and interview resources you keep publishing for job seekers, including remote roles and interview-preparation material",
    message: `Hey Nishant — I was looking through the current openings and interview resources you keep publishing for job seekers, including the remote roles and interview-preparation material. Your audience is clearly not just consuming generic career motivation — they're actively trying to get hired.

I run GOLIDE. We've built a $19.99 Job Search Conversion System for people who are applying but not getting enough interviews, with a practical system rather than a promise of guaranteed employment.

I'm inviting a few founding partners to review it. You'd get the complete product free first, your own tracked Whop link, and ready-made promo assets. The affiliate commission is 80% of every sale you refer.

If you review it and think it could genuinely help the job seekers already following your updates, would you be open to testing it with your audience?`,
  },
  {
    name: "Career Contessa",
    platform: "YouTube",
    handle: "careercontessa",
    audienceSize: 26900,
    reason: "Active career and professional-development publisher with current YouTube job-search content and a highly relevant audience.",
    hook: "your active job-search video library, including recent material on behavioral interview answers, writing samples, second interviews and resume structure",
    message: `Hi Career Contessa team — I came across your active job-search video library, especially the practical material around behavioral interview answers, writing samples, second interviews and resume structure. It is unusually close to the problem we're trying to solve at GOLIDE.

We've built a $19.99 Job Search Conversion System for people who are applying but not converting enough applications into interviews. It is a practical digital system, not a guaranteed-job claim.

We're opening a small founding-partner group and I think your audience is a strong fit. We'd provide the complete product free for your team to inspect first, a tracked Whop affiliate link and ready-made creative assets if helpful. The affiliate commission is 80% per referred sale.

Would someone on the team be open to reviewing it and deciding whether it's worth testing with your audience?`,
  },
  {
    name: "Kemi Onadiran",
    platform: "TikTok",
    handle: "careers_with_kemi",
    audienceSize: 14510,
    reason: "Active career coach with a job-seeker audience, substantial back-catalogue of CV, workplace and career guidance, and recent TikTok activity.",
    hook: "your continuing TikTok career guidance and the way your page combines practical CV, workplace and job-search advice rather than generic motivation",
    message: `Hey Kemi — I found your TikTok while looking specifically for active career creators, and what stood out is that your page combines practical CV, workplace and job-search guidance rather than only motivational content.

I run GOLIDE, and we've built a $19.99 Job Search Conversion System for people who keep applying but aren't getting enough interviews. I think that problem overlaps strongly with the audience you've already built.

I'm inviting a small number of founding partners. You'd receive the complete product free to review, a tracked Whop link, and ready-made promotion assets if you want them. The affiliate commission is 80% of every referred sale.

I'd rather you inspect the product first and only share it if you think it genuinely helps your audience. Would you be open to reviewing it?`,
  },
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
  if (platform.toLowerCase() === "youtube") return `https://www.youtube.com/@${encodeURIComponent(cleanHandle)}`;
  return "";
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
        VALUES (?1, ?2, ?3, ?4, ?5, '', ?6, ?7, ?8, ?9, 'NEW', '', 'Qualified at 10K+ followers with recent activity verified before seeding.', NULL, ?10, ?11)
      `).bind(
        crypto.randomUUID(),
        prospect.name,
        prospect.platform,
        handle,
        profileUrl,
        prospect.audienceSize,
        prospect.reason,
        prospect.hook,
        prospect.message,
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
    const audienceSize = cleanInt(prospect.audienceSize);
    const outreachMessage = cleanText(prospect.outreachMessage, 4000);
    const profileUrl = safeUrl(prospect.profileUrl) || defaultProfileUrl(platform, handle);
    if (!handle || !profileUrl) return NextResponse.json({ error: "Handle and valid profile URL are required." }, { status: 400 });
    if (audienceSize < 10000) return NextResponse.json({ error: "Partner prospects must have at least 10,000 followers." }, { status: 400 });
    if (!reason || !hook || !outreachMessage) return NextResponse.json({ error: "Fit reason, current content hook and a fully personalized outreach message are required." }, { status: 400 });

    const now = Date.now();
    try {
      await db.insert(partnerProspects).values({
        id: crypto.randomUUID(),
        name,
        platform,
        handle,
        profileUrl,
        contact: cleanText(prospect.contact, 240),
        audienceSize,
        reason,
        personalHook: hook,
        outreachMessage,
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
