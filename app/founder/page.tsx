import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, BriefcaseBusiness, Code2, Download, FlaskConical, Globe2, ShieldCheck } from "lucide-react";
import { Footer, Header } from "../shared";

export const metadata: Metadata = { title: "Esiah Kapinga, Founder", description: "The story, experience and selected work of GOLIDE founder Esiah Kapinga." };

const projects = [
  { title: "SYLA Analytics", type: "AI / Data platform", image: "/syla-card.webp", href:"/projects/syla", copy: "Automated visualisation, forecasting and file intelligence designed to shorten the distance between data and a decision." },
  { title: "Malaria Intelligence", type: "DHIS2 / Public health", image: "/dhis2-card.webp", href:"/projects/malaria", copy: "A surveillance dashboard connecting WHO data, facility monitoring, data quality and outbreak signals." },
  { title: "Child Mortality Analysis", type: "UNICEF / R", image: "/unicef.webp", href:"/projects/child-mortality", copy: "Interactive exploration of child mortality trends and the socioeconomic patterns behind them." },
  { title: "Tinospora Phylogenetics", type: "Bioinformatics", image: "/tinospora.webp", href:"/projects/tinospora", copy: "Sequence alignment and comparative genomics used to examine evolutionary relationships across species." },
];

export default function FounderPage() {
  return <main className="neo-site"><Header/>
    <section className="founder-hero shell"><div className="founder-hero-copy"><p className="eyebrow"><span/> Founder / Builder / Scientist</p><h1>Esiah<br/><em>Kapinga.</em></h1><p>A microbiologist who learned to code because analysis should lead somewhere—and a builder creating systems where science, technology and enterprise reinforce one another.</p><a className="scroll-cue" href="#story">The story <ArrowDown size={17}/></a></div><div className="portrait-frame"><Image src="/esiah-graduate.webp" alt="Esiah Kapinga" fill priority sizes="(max-width: 800px) 100vw, 48vw"/><div className="portrait-label"><span>Founder, GOLIDE</span><strong>Lusaka, Zambia</strong></div></div></section>

    <section className="founder-intro shell" id="story"><p className="big-index">01</p><div><p className="eyebrow"><span/> Origin</p><h2>Not a straight line.<br/>A connected one.</h2></div><div className="story-copy"><p>Esiah began in microbiology, studying living systems and the evidence hidden inside them. Data analysis introduced another language for the same instinct: finding structure inside complexity.</p><p>Software made it possible to turn those insights into tools. Quality assurance added discipline—systems must work consistently, not only look impressive once. GOLIDE brings those lessons under one roof.</p></div></section>

    <section className="dark-band"><div className="shell"><div className="band-heading"><p className="eyebrow"><span/> Working intersections</p><h2>One mind.<br/>Four operating systems.</h2></div><div className="discipline-grid"><article><FlaskConical/><span>01</span><h3>Microbiology</h3><p>Scientific reasoning, molecular biology and an evidence-first approach.</p></article><article><Code2/><span>02</span><h3>Technology</h3><p>Python, R and web systems that make data useful and accessible.</p></article><article><ShieldCheck/><span>03</span><h3>Quality</h3><p>Food safety, FSSC 22000, HACCP and process discipline on the production floor.</p></article><article><BriefcaseBusiness/><span>04</span><h3>Enterprise</h3><p>Products, media and market systems designed to create durable value.</p></article></div></div></section>

    <section className="section shell"><div className="section-head"><div><p className="eyebrow"><span/> Selected work</p><h2>Building evidence<br/>into interfaces.</h2></div><p>Every project below now opens into a complete case-study page with its original media, tools and working archive.</p></div><div className="project-list">{projects.map((p,i)=><Link href={p.href} className="project-row" key={p.title}><span className="project-number">0{i+1}</span><div className="project-thumb"><Image src={p.image} alt="" fill sizes="180px"/></div><div><small>{p.type}</small><h3>{p.title}</h3><p>{p.copy}</p></div><ArrowRight className="project-arrow"/></Link>)}</div></section>

    <section className="experience-archive"><div className="shell experience-heading"><div><p className="neo-kicker"><Globe2/> EXPERIENCE ARCHIVE</p><h2>The work happened<br/>in real rooms.</h2></div><p>From hospital laboratories and industrial visits in India to graduation and international collaboration—the portfolio is more than a list of titles.</p></div><div className="experience-rail">{[1,2,3,4,5,6,7,8,1,2,3].map((n,i)=><div className={`experience-frame frame-${(i%3)+1}`} key={`${n}-${i}`}><Image src={`/experience/e-${n}.webp`} alt="Esiah Kapinga professional and academic experience" fill sizes="420px"/></div>)}</div></section>

    <section className="timeline shell"><div className="timeline-title"><p className="eyebrow"><span/> Journey</p><h2>Experience that compounds.</h2></div><div className="timeline-list"><article><time>2026 — Present</time><div><h3>Quality Assurance Officer</h3><strong>BigTree Beverages · Trade Kings Group</strong><p>Food-safety systems, production-process control, internal compliance and continuous improvement.</p></div></article><article><time>2025</time><div><h3>BSc Microbiology</h3><strong>Marwadi University · India</strong><p>Microbiology, molecular biology, bioinformatics, health informatics and research communication.</p></div></article><article><time>2024 — 2025</time><div><h3>Laboratory & Data Experience</h3><strong>Gokul Hospital · Excelerate / Saint Louis University</strong><p>Clinical microbiology, health-data visualisation and remote international collaboration.</p></div></article></div></section>

    <section className="credentials shell"><div><Globe2/><strong>International perspective</strong><span>Zambia · India · Global digital work</span></div><div><ShieldCheck/><strong>Systems discipline</strong><span>FSSC 22000 · HACCP · GMP</span></div><div><Code2/><strong>Technical practice</strong><span>Python · R · JavaScript · DHIS2</span></div></section>

    <section className="cta shell"><div><p className="eyebrow"><span/> Full profile</p><h2>Credentials when they matter. Work when it counts.</h2></div><Link className="button light" href="/Esiah-Kapinga-Resume.pdf" target="_blank">View résumé <Download size={17}/></Link></section><Footer/>
  </main>;
}
