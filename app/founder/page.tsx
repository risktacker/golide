import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BrainCircuit, Code2, Dna, Download, Globe2, ShieldCheck, Workflow } from "lucide-react";
import { Footer, Header } from "../shared";

export const metadata: Metadata = { title: "Esiah Kapinga, Founder", description: "The founder story, experience and selected work behind GOLIDE." };

const projects = [
  { title: "SYLA Analytics", type: "AI / Data platform", image: "/syla-card.webp", href:"/projects/syla", copy: "Automated visualisation, forecasting and file intelligence designed to shorten the distance between data and a decision." },
  { title: "Malaria Intelligence", type: "DHIS2 / Public health", image: "/dhis2-card.webp", href:"/projects/malaria", copy: "A surveillance dashboard connecting WHO data, facility monitoring, data quality and outbreak signals." },
  { title: "Child Mortality Analysis", type: "UNICEF / R", image: "/unicef.webp", href:"/projects/child-mortality", copy: "Interactive exploration of child mortality trends and the socioeconomic patterns behind them." },
  { title: "Tinospora Phylogenetics", type: "Bioinformatics", image: "/tinospora.webp", href:"/projects/tinospora", copy: "Sequence alignment and comparative genomics used to examine evolutionary relationships across species." },
];

const origin = [
  { year:"ROOTS", title:"Chinsanka Village, Samfya", copy:"Born in Milambo, now known as Chinsanka Village, in Samfya District, Luapula Province. The story begins far from a technology hub—and that distance became part of the drive to build." },
  { year:"2008—2016", title:"Chinsanka Basic School", copy:"Pre-school through Grade 7. The foundation was simple: learn fast, compete seriously and make the most of what was available." },
  { year:"2017—2021", title:"Miloke Secondary School", copy:"Junior and senior secondary school brought academic leadership and competition: first-position results, district SOSTAZ participation in Civic Education, a third-place district Geography result, prefect responsibilities and Academic Prefect in Grade 12." },
  { year:"2022", title:"From Samfya to Rajkot", copy:"Six months after the Grade 12 results, the move was from Zambia to Rajkot, India, to study BSc Microbiology at Marwadi University. The first laptop was modest; curiosity about what it could actually do opened the door to HTML, CSS and then Python." },
  { year:"2022—2025", title:"Microbiology met computing", copy:"Editing and digital art became practical skills, coding became a serious discipline, and bioinformatics connected software directly to biology. Projects expanded into biological data science, public-health analytics and research interfaces." },
  { year:"2025—NOW", title:"Degree, industry, GOLIDE", copy:"Returned to Zambia with a BSc Microbiology, First Class with Distinction. After document verification, the first application led to the first interview and first industry role in Quality Assurance at BigTree Beverages, later specialising in syrup and production supervision—while GOLIDE grew as the system connecting software, intelligence and research." },
];

const services = [
  { no:"01", icon:Code2, title:"Software & web systems", copy:"Responsive product interfaces, internal tools, dashboards and web platforms built around real workflows." },
  { no:"02", icon:BrainCircuit, title:"AI & data intelligence", copy:"Analytics, forecasting, data interpretation and intelligent features that turn raw information into decisions." },
  { no:"03", icon:Workflow, title:"Automation & digital products", copy:"Connected workflows, content systems and product infrastructure designed to remove repetitive work and scale output." },
  { no:"04", icon:Dna, title:"Scientific computing", copy:"Bioinformatics, health-data systems and research interfaces that make complex scientific evidence usable." },
];

const experienceImages = [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8];

export default function FounderPage() {
  return <main className="neo-site founder-page"><Header/>
    <section className="founder-hero shell"><div className="founder-hero-copy"><p className="eyebrow"><span/> Founder / Builder / Scientist</p><h1>Esiah<br/><em>Kapinga.</em></h1><p>From a village in Samfya to microbiology, software, quality systems and digital products—the work is built around one idea: capability compounds when disciplines connect.</p><a className="scroll-cue" href="#story">The origin <ArrowDown size={17}/></a></div><div className="portrait-frame"><img className="raw-fill" src="/esiah-founder.png?v=20260905" alt="Esiah Kapinga, founder of GOLIDE"/><div className="portrait-grid"/><div className="portrait-label"><span>Founder, GOLIDE</span><strong>Lusaka, Zambia</strong></div></div></section>

    <section className="founder-intro shell" id="story"><div className="origin-heading"><p className="big-index">01</p><div><p className="eyebrow"><span/> Origin</p><h2>The road to GOLIDE<br/>started long before the code.</h2></div><p>Not a polished founder myth. A sequence of small environments, academic pressure, curiosity and increasingly larger systems.</p></div><div className="origin-storyboard">{origin.map((item,i)=><article key={item.year+"-"+i}><span>{item.year}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>

    <section className="dark-band"><div className="shell"><div className="band-heading"><p className="eyebrow"><span/> GOLIDE / WORK INTERSECTION</p><h2>What the hub builds<br/>in the computer world.</h2><p>Services and products are organised around useful systems—not a list of programming languages.</p></div><div className="discipline-grid">{services.map(({icon:Icon,...service})=><article key={service.no}><Icon/><span>{service.no}</span><h3>{service.title}</h3><p>{service.copy}</p></article>)}</div></div></section>

    <section className="section shell"><div className="section-head"><div><p className="eyebrow"><span/> Selected work</p><h2>Building evidence<br/>into interfaces.</h2></div><p>Each project opens into a complete case-study page with its original media, tools and working archive.</p></div><div className="project-list">{projects.map((p,i)=><Link href={p.href} className="project-row" key={p.title}><span className="project-number">0{i+1}</span><div className="project-thumb"><img className="raw-fill" src={p.image+"?v=20260905"} alt={p.title}/></div><div><small>{p.type}</small><h3>{p.title}</h3><p>{p.copy}</p></div><ArrowRight className="project-arrow"/></Link>)}</div></section>

    <section className="experience-archive"><div className="shell experience-heading"><div><p className="neo-kicker"><Globe2/> EXPERIENCE ARCHIVE</p><h2>The work happened<br/>in real rooms.</h2></div><p>Academic, laboratory, industrial and international experience shown as a moving visual archive rather than a static gallery.</p></div><div className="experience-track"><div className="experience-rail">{experienceImages.map((n,i)=><div className={"experience-frame frame-"+((i%3)+1)} key={n+"-"+i}><img className="raw-fill" src={"/experience/e-"+n+".webp?v=20260905"} alt="Esiah Kapinga professional and academic experience" loading="eager"/><div className="experience-scan"/></div>)}</div></div></section>

    <section className="timeline shell"><div className="timeline-title"><p className="eyebrow"><span/> Journey</p><h2>Experience that compounds.</h2></div><div className="timeline-list"><article><time>2026 — Present</time><div><h3>Quality Assurance Officer</h3><strong>BigTree Beverages · Trade Kings Group</strong><p>Production-process control, food-safety systems, compliance and syrup-focused QA supervision.</p></div></article><article><time>2025</time><div><h3>BSc Microbiology — First Class with Distinction</h3><strong>Marwadi University · India</strong><p>Microbiology, molecular biology, bioinformatics, health informatics and research communication.</p></div></article><article><time>2024 — 2025</time><div><h3>Laboratory & Data Experience</h3><strong>Gokul Hospital · Excelerate / Saint Louis University</strong><p>Clinical microbiology, health-data visualisation and remote international collaboration.</p></div></article></div></section>

    <section className="credentials shell"><div><Globe2/><strong>International perspective</strong><span>Zambia · India · Global digital work</span></div><div><ShieldCheck/><strong>Systems discipline</strong><span>Quality assurance · Food safety · Process control</span></div><div><Code2/><strong>Technical practice</strong><span>Software · Data · Automation · Bioinformatics</span></div></section>

    <section className="cta shell"><div><p className="eyebrow"><span/> Full profile</p><h2>Credentials when they matter. Work when it counts.</h2></div><Link className="button light" href="/Esiah-Kapinga-Resume.pdf" target="_blank">View résumé <Download size={17}/></Link></section><Footer/>
  </main>;
}