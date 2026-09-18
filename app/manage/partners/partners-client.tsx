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
import styles from "./partner-engine.module.css";

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
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <a className={styles.brand} href="https://golidee.com/" aria-label="GOLIDE home">
            <img src="/brand/wordmark.png" alt="GOLIDE" />
          </a>
          <a className={styles.domainLink} href="https://marketplace.golidee.com/">
            <ArrowLeft size={14} /><span>Back to marketplace</span>
          </a>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Private growth console</p>
            <h1>Partner <span>Engine.</span></h1>
            <p className={styles.heroText}>
              One focused queue for GOLIDE&apos;s first sale: open the right account, copy the prepared message, send it, and move the relationship forward.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.secondaryButton} onClick={() => void load("Queue refreshed.")} disabled={loading}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className={styles.primaryButton} onClick={() => setShowAdd((value) => !value)}>
              <Plus size={14} /> {showAdd ? "Close form" : "Add prospect"}
            </button>
          </div>
        </section>

        <section className={styles.stats} aria-label="Partner pipeline">
          {statusOrder.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "ALL" : status)}
              className={`${styles.stat} ${filter === status ? styles.statActive : ""}`}
              aria-pressed={filter === status}
            >
              <span className={styles.statNumber}>{counts[status]}</span>
              <span className={styles.statLabel}>{statusLabel[status]}</span>
            </button>
          ))}
        </section>

        {message && <p className={styles.message}>{message}</p>}

        {showAdd && (
          <form onSubmit={addProspect} className={styles.addPanel}>
            <label className={styles.label}>Name<input name="name" /></label>
            <label className={styles.label}>Platform<select name="platform" defaultValue="Instagram"><option>Instagram</option><option>TikTok</option><option>LinkedIn</option><option>YouTube</option><option>Email</option></select></label>
            <label className={styles.label}>Handle<input name="handle" required placeholder="careercreator" /></label>
            <label className={styles.label}>Profile URL<input name="profileUrl" type="url" placeholder="Optional for Instagram / TikTok" /></label>
            <label className={styles.label}>Audience size<input name="audienceSize" type="number" min="0" /></label>
            <label className={styles.label}>Email / contact<input name="contact" /></label>
            <label className={`${styles.label} ${styles.full}`}>Why this account?<textarea name="reason" rows={2} /></label>
            <label className={`${styles.label} ${styles.full}`}>Personal hook<textarea name="personalHook" rows={2} placeholder="Their recent interview-prep post" /></label>
            <label className={`${styles.label} ${styles.full}`}>Custom outreach message <span>(optional — a default is created)</span><textarea name="outreachMessage" rows={5} /></label>
            <div className={styles.formActions}><button type="submit" disabled={loading} className={styles.primaryButton}>Save prospect</button></div>
          </form>
        )}

        {!prospects.length && !loading ? (
          <section className={styles.empty}>
            <span className={styles.emptyIcon}><Users size={22} /></span>
            <h2>Load the researched queue.</h2>
            <p>The first prospects are already prepared so the system starts with real accounts instead of handing the research job back to you.</p>
            <button onClick={() => void seed()} className={styles.primaryButton}>Load starter prospects</button>
          </section>
        ) : (
          <section className={styles.queue}>
            {loading && <div className={styles.loading}><LoaderCircle className={styles.spin} size={15} /> Updating queue…</div>}
            {visible.map((prospect) => (
              <article className={styles.card} key={prospect.id}>
                <div className={styles.cardGrid}>
                  <div className={styles.identity}>
                    <div className={styles.chips}>
                      <span className={styles.chip}>{prospect.platform}</span>
                      <span className={styles.statusChip}>{statusLabel[prospect.status]}</span>
                    </div>
                    <h2 className={styles.name}>{prospect.name || `@${prospect.handle}`}</h2>
                    <p className={styles.handle}>@{prospect.handle} · {compactNumber(prospect.audienceSize)}</p>
                    <p className={styles.reason}>{prospect.reason || "Relevant job-search audience."}</p>
                    {prospect.personalHook && <p className={styles.hook}>Hook: {prospect.personalHook}</p>}
                    <div className={styles.cardActions}>
                      <a className={styles.openButton} href={prospect.profileUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Open profile</a>
                      <button className={styles.copyButton} onClick={() => void copyMessage(prospect)}><Clipboard size={13} /> Copy message</button>
                    </div>
                  </div>
                  <div className={styles.messageBox}>
                    <p className={styles.messageTitle}>Prepared outreach</p>
                    <p className={styles.messageBody}>{prospect.outreachMessage}</p>
                  </div>
                </div>

                <div className={styles.stageBar}>
                  {prospect.status === "NEW" && <button onClick={() => void setStatus(prospect.id, "CONTACTED")} className={styles.stageButton}><Send size={13} /> Mark sent</button>}
                  {prospect.status === "CONTACTED" && <>
                    <button onClick={() => void setStatus(prospect.id, "REPLIED")} className={styles.stageButton}><Check size={13} /> Replied</button>
                    <button onClick={() => void setStatus(prospect.id, "NO_REPLY")} className={styles.quietButton}>No reply</button>
                  </>}
                  {prospect.status === "REPLIED" && <button onClick={() => void setStatus(prospect.id, "PARTNER")} className={styles.stageButton}>Convert to partner</button>}
                  {prospect.status === "PARTNER" && <button onClick={() => void setStatus(prospect.id, "SALE")} className={styles.saleButton}>Record sale</button>}
                  {(prospect.status === "NO_REPLY" || prospect.status === "SALE") && <button onClick={() => void setStatus(prospect.id, "NEW")} className={styles.quietButton}>Return to queue</button>}
                  <button onClick={() => void remove(prospect.id, prospect.handle)} className={styles.deleteButton} aria-label={`Remove @${prospect.handle}`}><Trash2 size={13} /></button>
                </div>
              </article>
            ))}
            {!visible.length && prospects.length > 0 && <div className={styles.noResults}>Nothing in this stage yet.</div>}
          </section>
        )}

        <footer className={styles.footerNote}>
          <span><strong>GOLIDE Partner Engine</strong> · private admin workspace</span>
          <span>Target: move one real relationship to SALE.</span>
        </footer>
      </div>
    </main>
  );
}
