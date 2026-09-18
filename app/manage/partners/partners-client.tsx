"use client";

import {
  ArrowLeft,
  Check,
  Clipboard,
  ExternalLink,
  LoaderCircle,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Status = "NEW" | "CONTACTED" | "REPLIED" | "PARTNER" | "SALE" | "NO_REPLY";

type Prospect = {
  id: string;
  name: string;
  platform: string;
  handle: string;
  profileUrl: string;
  contact: string;
  audienceSize: number;
  reason: string;
  personalHook: string;
  outreachMessage: string;
  status: Status;
  affiliateLink: string;
  notes: string;
  lastContactedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

const statusOrder: Status[] = ["NEW", "CONTACTED", "REPLIED", "PARTNER", "SALE", "NO_REPLY"];
const statusLabel: Record<Status, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  PARTNER: "Partner",
  SALE: "Sale",
  NO_REPLY: "No reply",
};

function compactNumber(value: number) {
  if (!value) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function PartnersClient() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState("");

  const api = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/partner-prospects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Partner request failed.");
    return data;
  }, []);

  const load = useCallback(async (successMessage?: string) => {
    setLoading(true);
    try {
      const data = await api({ action: "list" });
      setProspects(data.prospects || []);
      if (successMessage) setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load partner queue.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const result = Object.fromEntries(statusOrder.map((status) => [status, 0])) as Record<Status, number>;
    prospects.forEach((prospect) => { result[prospect.status] += 1; });
    return result;
  }, [prospects]);

  const visible = useMemo(
    () => filter === "ALL" ? prospects : prospects.filter((prospect) => prospect.status === filter),
    [filter, prospects],
  );

  async function seed() {
    setLoading(true);
    setMessage("");
    try {
      const data = await api({ action: "seed" });
      setProspects(data.prospects || []);
      setMessage("Starter partner list loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load starter list.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: Status) {
    setLoading(true);
    setMessage("");
    try {
      await api({ action: "status", id, status });
      await load(`Moved to ${statusLabel[status]}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update prospect.");
      setLoading(false);
    }
  }

  async function remove(id: string, handle: string) {
    if (!confirm(`Remove @${handle} from the partner queue?`)) return;
    setLoading(true);
    try {
      await api({ action: "delete", id });
      await load("Prospect removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove prospect.");
      setLoading(false);
    }
  }

  async function copyMessage(prospect: Prospect) {
    try {
      await navigator.clipboard.writeText(prospect.outreachMessage);
      setMessage(`Message copied for @${prospect.handle}.`);
    } catch {
      setMessage("Clipboard access failed. Select the message manually.");
    }
  }

  async function addProspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setMessage("");
    try {
      await api({
        action: "create",
        prospect: {
          name: form.get("name"),
          platform: form.get("platform"),
          handle: form.get("handle"),
          profileUrl: form.get("profileUrl"),
          contact: form.get("contact"),
          audienceSize: form.get("audienceSize"),
          reason: form.get("reason"),
          personalHook: form.get("personalHook"),
          outreachMessage: form.get("outreachMessage"),
        },
      });
      event.currentTarget.reset();
      setShowAdd(false);
      await load("Prospect added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add prospect.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#03070b] text-[#edf7ff]">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-8 md:py-12">
        <a href="https://golidee.com/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300">
          <ArrowLeft size={15} /> golidee.com
        </a>

        <header className="mt-8 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-300">GOLIDE PARTNER ENGINE</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] md:text-6xl">First-sale queue.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Find the right people, open the account, copy the prepared message, send it, then move the lead forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void load("Queue refreshed.")} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm hover:border-cyan-300/40 disabled:opacity-50">
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={() => setShowAdd((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950">
              <Plus size={15} /> Add prospect
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 py-6 md:grid-cols-6">
          {statusOrder.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "ALL" : status)}
              className={`rounded-2xl border p-4 text-left transition ${filter === status ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.025] hover:border-white/20"}`}
            >
              <div className="text-2xl font-bold">{counts[status]}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{statusLabel[status]}</div>
            </button>
          ))}
        </section>

        {message && <div className="mb-5 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-sm text-cyan-100">{message}</div>}

        {showAdd && (
          <form onSubmit={addProspect} className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-[#081019] p-5 md:grid-cols-2">
            <label className="text-xs text-slate-400">Name<input name="name" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400">Platform<select name="platform" defaultValue="Instagram" className="mt-2 w-full rounded-lg border border-white/10 bg-[#07101a] p-3 text-sm text-white outline-none"><option>Instagram</option><option>TikTok</option><option>LinkedIn</option><option>YouTube</option><option>Email</option></select></label>
            <label className="text-xs text-slate-400">Handle<input name="handle" required placeholder="careercreator" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400">Profile URL<input name="profileUrl" type="url" placeholder="Optional for Instagram/TikTok" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400">Audience size<input name="audienceSize" type="number" min="0" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400">Email / contact<input name="contact" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400 md:col-span-2">Why this account?<textarea name="reason" rows={2} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400 md:col-span-2">Personal hook<textarea name="personalHook" rows={2} placeholder="their recent interview-prep post" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <label className="text-xs text-slate-400 md:col-span-2">Custom outreach message <span className="text-slate-600">(optional — a default is created)</span><textarea name="outreachMessage" rows={5} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-cyan-300/40" /></label>
            <div className="md:col-span-2 flex justify-end"><button type="submit" disabled={loading} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">Save prospect</button></div>
          </form>
        )}

        {!prospects.length && !loading ? (
          <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <Users className="mx-auto text-cyan-300" />
            <h2 className="mt-4 text-2xl font-bold">Start with the researched queue.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">Load the initial career and job-search creators so you are not being handed the research job.</p>
            <button onClick={() => void seed()} className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">Load starter prospects</button>
          </section>
        ) : (
          <section className="grid gap-4">
            {loading && (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={16} /> Updating queue…</div>
            )}
            {visible.map((prospect) => (
              <article key={prospect.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a121d] to-[#060a10] p-5 shadow-2xl shadow-black/20">
                <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-200">{prospect.platform}</span>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{statusLabel[prospect.status]}</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">{prospect.name || `@${prospect.handle}`}</h2>
                    <p className="mt-1 text-sm text-slate-500">@{prospect.handle} · {compactNumber(prospect.audienceSize)}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{prospect.reason || "Relevant job-search audience."}</p>
                    {prospect.personalHook && <p className="mt-3 border-l-2 border-cyan-300/30 pl-3 text-xs leading-5 text-slate-500">Hook: {prospect.personalHook}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a href={prospect.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:border-cyan-300/40">
                        <ExternalLink size={14} /> Open profile
                      </a>
                      <button onClick={() => void copyMessage(prospect)} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950">
                        <Clipboard size={14} /> Copy message
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Prepared message</p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{prospect.outreachMessage}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                  {prospect.status === "NEW" && <button onClick={() => void setStatus(prospect.id, "CONTACTED")} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-bold text-cyan-200"><Send size={13} /> Mark sent</button>}
                  {prospect.status === "CONTACTED" && <><button onClick={() => void setStatus(prospect.id, "REPLIED")} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 px-3 py-2 text-xs font-bold text-cyan-200"><Check size={13} /> Replied</button><button onClick={() => void setStatus(prospect.id, "NO_REPLY")} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400">No reply</button></>}
                  {prospect.status === "REPLIED" && <button onClick={() => void setStatus(prospect.id, "PARTNER")} className="rounded-lg border border-violet-300/30 px-3 py-2 text-xs font-bold text-violet-200">Convert to partner</button>}
                  {prospect.status === "PARTNER" && <button onClick={() => void setStatus(prospect.id, "SALE")} className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">Record sale</button>}
                  {(prospect.status === "NO_REPLY" || prospect.status === "SALE") && <button onClick={() => void setStatus(prospect.id, "NEW")} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400">Return to queue</button>}
                  <button onClick={() => void remove(prospect.id, prospect.handle)} className="ml-auto rounded-lg border border-white/10 p-2 text-slate-600 hover:border-red-400/30 hover:text-red-300" aria-label={`Remove @${prospect.handle}`}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
            {!visible.length && prospects.length > 0 && <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-500">Nothing in this stage yet.</div>}
          </section>
        )}
      </div>
    </main>
  );
}
