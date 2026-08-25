import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Beaker, Bot, ChevronRight, CircleDot, Dna, Globe2, MoveUpRight, Play, Radio, Workflow } from "lucide-react";
import { CodePulse, FloatingBadge, KineticHero, Marquee } from "./kinetic";
import { Footer, Header } from "./shared";

const ventures = [
  { no:"01", icon:BarChart3, name:"SYLA", type:"AI analytics platform", state:"Rebuild in progress", text:"From raw files to visualisations, forecasts and decisions—with less friction between question and answer.", href:"/projects/syla", accent:"cyan" },
  { no:"02", icon:Bot, name:"Market Systems", type:"Trading intelligence", state:"In development", text:"Risk, execution and performance tools designed around discipline—not promises or shortcuts.", href:"#", accent:"violet" },
  { no:"03", icon:Dna, name:"Research Lab", type:"Bioinformatics + health", state:"Active", text:"Computational research and public-health systems that turn complex evidence into usable intelligence.", href:"/research", accent:"lime" },
];

const projects = [
  { no:"01", title:"SYLA Analytics", area:"AI / Data", image:"/syla-card.webp", href:"/projects/syla", video:true },
  { no:"02", title:"Malaria Intelligence", area:"DHIS2 / Health", image:"/dhis2-card.webp", href:"/projects/malaria", video:true },
  { no:"03", title:"Tinospora Phylogenetics", area:"Bioinformatics", image:"/tinospora.webp", href:"/projects/tinospora" },
  { no:"04", title:"Child Mortality Patterns", area:"UNICEF / R", image:"/unicef.webp", href:"/projects/child-mortality" },
];

export default function Home(){return <main className="neo-site"><Header/>
  <section className="neo-hero shell"><div className="neo-copy"><p className="neo-kicker"><Radio/> GOLIDE NETWORK / ACTIVE</p><h1>Where ideas<br/><span>become systems.</span></h1><p>One interconnected hub for software, market intelligence, scientific research and the people building what comes next.</p><div className="neo-actions"><Link className="neo-button solid" href="#ecosystem">Enter the ecosystem <ArrowRight/></Link><Link className="neo-button bare" href="/founder">Founder profile <MoveUpRight/></Link></div><div className="hero-metrics"><div><strong>03</strong><span>Venture lanes</span></div><div><strong>05+</strong><span>Built projects</span></div><div><strong>02</strong><span>Continents lived</span></div></div></div><KineticHero/><FloatingBadge/></section>
  <Marquee items={["SOFTWARE","MARKETS","SCIENCE","MEDIA","CONNECTION"]}/>

  <section className="neo-section shell" id="ecosystem"><div className="neo-section-head"><div><p className="neo-kicker"><CircleDot/> ECOSYSTEM MAP</p><h2>Different disciplines.<br/><span>One compounding engine.</span></h2></div><p>GOLIDE is structured as a living network. Products can launch independently while research, technology and distribution strengthen every new venture.</p></div><div className="venture-stack">{ventures.map(({icon:Icon,...v})=><Link className={`neo-venture ${v.accent}`} href={v.href} key={v.no}><span className="venture-no">{v.no}</span><div className="venture-icon"><Icon/></div><div className="venture-name"><small>{v.type}</small><h3>{v.name}</h3></div><p>{v.text}</p><div className="venture-state"><i/>{v.state}</div><ChevronRight/></Link>)}</div></section>

  <section className="product-signal"><div className="shell product-grid"><div className="product-copy"><p className="neo-kicker"><Workflow/> PRODUCT SIGNAL / 01</p><h2>SYLA is being rebuilt to make analysis feel immediate.</h2><p>The first GOLIDE SaaS product will bring visualisation, forecasting and file intelligence into one focused workspace.</p><Link className="neo-button solid" href="/projects/syla">See the product story <ArrowRight/></Link><CodePulse/></div><div className="video-console"><div className="console-bar"><span><i/><i/><i/></span><small>SYLA / PRODUCT ARCHIVE</small><strong>01:18</strong></div><video autoPlay muted loop playsInline poster="/syla-card.webp"><source src="https://raw.githubusercontent.com/esiiah/portfolio-site/main/videos/why-syla.mp4" type="video/mp4"/></video><div className="console-overlay"><Play fill="currentColor"/><span>Platform walkthrough</span></div></div></div></section>

  <section className="neo-section shell"><div className="neo-section-head"><div><p className="neo-kicker"><Globe2/> SELECTED OUTPUT</p><h2>Projects that work<br/><span>beyond the thumbnail.</span></h2></div><Link className="neo-text-link" href="/research">All research <ArrowRight/></Link></div><div className="project-deck">{projects.map(p=><Link href={p.href} className="neo-project" key={p.no}><div className="project-media"><Image src={p.image} alt={p.title} fill sizes="(max-width:800px) 100vw, 50vw"/><div className="project-scan"/>{p.video&&<span className="video-pill"><Play fill="currentColor"/> Video inside</span>}</div><div className="project-caption"><span>{p.no}</span><div><small>{p.area}</small><h3>{p.title}</h3></div><MoveUpRight/></div></Link>)}</div></section>

  <section className="founder-window shell"><div className="founder-window-image"><Image src="/esiah-graduate.webp" alt="Esiah Kapinga, GOLIDE founder" fill sizes="(max-width:800px) 100vw, 50vw"/></div><div className="founder-window-copy"><p className="neo-kicker"><Beaker/> FOUNDER NODE / LUSAKA</p><h2>Built by someone who refuses to stay in one box.</h2><p>Esiah Kapinga connects microbiology, software development, quality systems, data and digital business into one operating vision.</p><blockquote>Science trains the questions. Technology scales the answer.</blockquote><Link className="neo-button solid" href="/founder">Open full portfolio <ArrowRight/></Link></div></section>

  <section className="neo-cta shell"><div><p className="neo-kicker"><CircleDot/> OPEN CHANNEL</p><h2>Build something that earns its place.</h2></div><a className="neo-button invert" href="mailto:esiahkapinga3@gmail.com">Start a conversation <ArrowRight/></a></section><Footer/>
 </main>}
