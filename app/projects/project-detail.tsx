import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, CircleDot, ExternalLink, Play, Radio } from "lucide-react";
import { Footer, Header } from "../shared";
import { Marquee } from "../kinetic";

const SITE = "https://golidee.com";

export type StudyTable = { caption: string; head: string[]; rows: string[][] };
export type StudyFigure = { src: string; alt: string; caption: string };
export type StudyLink = { label: string; href: string; note?: string };

// Long-form case study content, mirrored from the original portfolio project pages
// (github.com/esiiah/portfolio-site). Every section is optional.
export type Study = {
  overview: string[];
  objectivesTitle?: string;
  objectives?: string[];
  table?: StudyTable;
  methods?: { label: string; text: string }[];
  findingsTitle?: string;
  findings?: string[];
  figures?: StudyFigure[];
  applications?: string[];
  limitationsTitle?: string;
  limitations?: string[];
  links?: StudyLink[];
  references?: string[];
};

export type Project = {
  index: string; slug: string; title: string; eyebrow: string; summary: string; image: string; video?: string;
  tools: string[]; challenge: string; response: string; outcomes: string[]; external?: string;
  schemaType: "ScholarlyArticle" | "SoftwareApplication";
  study?: Study;
};

// Full openGraph/twitter blocks: a page-level openGraph replaces the layout's entirely.
export function projectMetadata(slug: string, title: string, description: string, image: string): Metadata {
  const url = `/projects/${slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    authors: [{ name: "Esiah Kapinga", url: `${SITE}/founder` }],
    openGraph: { type: "article", siteName: "GOLIDE", url, title: `${title} | GOLIDE`, description, images: [image] },
    twitter: { card: "summary_large_image", title: `${title} | GOLIDE`, description, images: [image] },
  };
}

function projectSchema(project: Project) {
  const url = `${SITE}/projects/${project.slug}`;
  const base = {
    "@context": "https://schema.org",
    "@type": project.schemaType,
    "@id": `${url}#work`,
    name: project.title,
    headline: project.title,
    description: project.summary,
    url,
    image: `${SITE}${project.image}`,
    author: { "@id": `${SITE}/founder#person` },
    creator: { "@id": `${SITE}/founder#person` },
    publisher: { "@id": `${SITE}/#organization` },
    keywords: project.tools.join(", "),
    inLanguage: "en",
    ...(project.external ? { sameAs: [project.external] } : {}),
  };
  return project.schemaType === "SoftwareApplication"
    ? { ...base, applicationCategory: "BusinessApplication", operatingSystem: "Web" }
    : base;
}

function StudyBody({ study }: { study: Study }) {
  return <section className="study shell" aria-label="Case study">
    <div className="study-block"><p className="neo-kicker"><CircleDot/> OVERVIEW</p><h2>Overview</h2>{study.overview.map(p => <p key={p}>{p}</p>)}</div>
    {study.objectives && <div className="study-block"><h2>{study.objectivesTitle ?? "Objectives"}</h2><ul>{study.objectives.map(o => <li key={o}>{o}</li>)}</ul></div>}
    {study.table && <div className="study-block"><h2>{study.table.caption}</h2><div className="study-table"><table><thead><tr>{study.table.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{study.table.rows.map(r => <tr key={r.join("|")}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table></div></div>}
    {study.methods && <div className="study-block"><h2>Methods and tools</h2><dl>{study.methods.map(m => <div key={m.label}><dt>{m.label}</dt><dd>{m.text}</dd></div>)}</dl></div>}
    {study.findings && <div className="study-block"><h2>{study.findingsTitle ?? "Key findings"}</h2><ul className="study-findings">{study.findings.map(f => <li key={f}><CheckCircle2/>{f}</li>)}</ul></div>}
    {study.figures && <div className="study-block"><h2>Figures</h2><div className="study-figures">{study.figures.map(f => <figure key={f.src}><img src={f.src} alt={f.alt} loading="lazy"/><figcaption>{f.caption}</figcaption></figure>)}</div></div>}
    {study.applications && <div className="study-block"><h2>Applications</h2><ul>{study.applications.map(a => <li key={a}>{a}</li>)}</ul></div>}
    {study.limitations && <div className="study-block"><h2>{study.limitationsTitle ?? "Limitations and next steps"}</h2><ul>{study.limitations.map(a => <li key={a}>{a}</li>)}</ul></div>}
    {study.links && <div className="study-block"><h2>Explore the original work</h2><ul className="study-links">{study.links.map(l => <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer">{l.label} <ArrowUpRight size={15}/></a>{l.note && <span>{l.note}</span>}</li>)}</ul></div>}
    {study.references && <div className="study-block study-refs"><h2>References</h2><ol>{study.references.map(r => <li key={r}>{r}</li>)}</ol></div>}
    <p className="study-byline">Project by <Link href="/founder">Esiah Kapinga</Link>, founder of GOLIDE.</p>
  </section>;
}

export function ProjectDetail({project}:{project:Project}){return <main className="neo-site"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema(project)).replace(/</g, "\\u003c") }} /><Header/><section className="project-hero shell"><Link href="/#projects" className="back-link"><ArrowLeft/> Back to projects</Link><div className="project-hero-grid"><div><p className="neo-kicker"><Radio/> PROJECT FILE / {project.index}</p><h1>{project.title}</h1><p>{project.summary}</p><div className="tool-cloud">{project.tools.map(t=><span key={t}>{t}</span>)}</div></div><div className="project-hero-media"><img className="raw-fill" src={project.image+"?v=20260907"} alt={project.title}/><span className="project-code">G/{project.index}</span></div></div></section><Marquee items={project.tools}/>
  {project.video&&<section className="project-video shell"><div className="project-video-copy"><p className="neo-kicker"><Play/> PRODUCT IN MOTION</p><h2>See the system, not just the screenshot.</h2><p>This original project footage is part of the build archive and shows the working interface.</p></div><div className="video-console"><div className="console-bar"><span><i/><i/><i/></span><small>{project.title} / DEMO</small><strong>PLAY</strong></div><video controls playsInline poster={project.image}><source src={project.video} type="video/mp4"/></video></div></section>}
  <section className="case-grid shell"><article><span>01 / Challenge</span><h2>{project.challenge}</h2></article><article><span>02 / Response</span><p>{project.response}</p></article></section>
  {project.study && <StudyBody study={project.study}/>}
  <section className="outcome-panel shell"><div><p className="neo-kicker"><CircleDot/> BUILD OUTPUT</p><h2>What the project delivered.</h2></div><div>{project.outcomes.map(o=><p key={o}><CheckCircle2/>{o}</p>)}</div></section>
  <section className="project-next shell"><div><span>Project status</span><strong>{project.external?"Available in archive":"Research archive"}</strong></div>{project.external?<a className="neo-button solid" target="_blank" rel="noreferrer" href={project.external}>Open original build <ExternalLink/></a>:<Link className="neo-button solid" href="/research">Explore research <ArrowRight/></Link>}</section><Footer/></main>}
