import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Beaker, Bot, ChevronRight, CircleDot, Dna, Globe2, MoveUpRight, Play, Radio, Workflow } from "lucide-react";
import { CodePulse, FloatingBadge, Marquee } from "./kinetic";
import { Footer, Header } from "./shared";

const ventures = [
  { no:"01", icon:BarChart3, name:"SYLA", type:"AI analytics platform", state:"Rebuild in progress", text:"From raw files to visualisations, forecasts and decisions—with less friction between question and answer.", href:"/projects/syla", accent:"cyan" },
  { no:"02", icon:Bot, name:"Market Systems", type:"Trading intelligence", state:"In development", text:"Risk, execution and performance tools designed around discipline—not promises or shortcuts.", href:"/ventures/market-systems", accent:"violet" },
  { no:"03", icon:Dna, name:"Research Lab", type:"Bioinformatics + health", state:"Active", text:"Computational research and public-health systems that turn complex evidence into usable intelligence.", href:"/research", accent:"lime" },
];

const projects = [
  { no:"01", title:"SYLA Analytics", area:"AI / Data", image:"/syla-card.webp", href:"/projects/syla", video:true },
  { no:"02", title:"Malaria Intelligence", area:"DHIS2 / Health", image:"/dhis2-card.webp", href:"/projects/malaria", video:true },
  { no:"03", title:"Tinospora Phylogenetics", area:"Bioinformatics", image:"/tinospora.webp", href:"/projects/tinospora" },
  { no:"04", title:"Child Mortality Patterns", area:"UNICEF / R", image:"/unicef.webp", href:"/projects/child-mortality" },
];

export default function Home(){return <main className="neo-site"><Header/>
  <section className="neo-hero hero-banner shell">
    <div className="hero-future-field" aria-hidden="true">
      <span className="future-line future-1">IDEAS → SYSTEMS</span>
      <span className="future-line future-2">GLOBAL BY DESIGN</span>
      <span className="future-line future-3">SCIENCE × SOFTWARE</span>
      <span className="future-line future-4">RESEARCH → PRODUCT</span>
      <span className="future-line future-5">BUILD / TEST / SHIP</span>
      <span className="future-line future-6">INTELLIGENCE</span>
      <span className="future-line future-7">FROM ZAMBIA</span>
      <span className="future-line future-8">WHAT COMES NEXT?</span>
      <span className="future-line future-9">AUTOMATION / DATA / SYSTEMS</span>
      <span className="future-line future-10">NEXT: GLOBAL SCALE</span>
      <div className="future-wire wire-a"/>
      <div className="future-wire wire-b"/>
      <div className="future-noise"/>
    </div>
    <div className="hero-real-portrait" aria-hidden="true">
      <img src="/founder/hero-standing-bw.webp?v=20260905" alt="" />
    </div>
    <div className="hero-banner-grid"/>
    <div className="hero-banner-scan"/>
    <div className="neo-copy hero-banner-copy">
      <p className="neo-kicker"><Radio/> GOLIDE NETWORK / ACTIVE</p>
      <h1>What if you could build <span>the next big thing?</span></h1>
      <div className="hero-question-roadmap">
        <p><b>01</b> What if the next billion-dollar idea started with you?</p>
        <p><b>02</b> For a moment, think about what you could become.</p>
      </div>
      <p className="hero-undertext">GOLIDE, the hub for software, intelligence, scientific research and the people building what comes next.</p>
      <div className="neo-actions"><Link className="neo-button solid" href="#ecosystem">Explore GOLIDE <ArrowRight/></Link><Link className="neo-button bare" href="/founder">Founder profile <MoveUpRight/></Link></div>
    </div>
    <FloatingBadge/>
  </section>
  <Marquee items={["SOFTWARE","INTELLIGENCE","SCIENCE","MEDIA","CONNECTION"]}/>

  <section className="neo-section shell" id="ecosystem"><div className="neo-section-head"><div><p className="neo-kicker"><CircleDot/> ECOSYSTEM MAP</p><h2>Different disciplines.<br/><span>One compounding engine.</span></h2></div><p>GOLIDE is structured as a living network. Products can launch independently while research, technology and distribution strengthen every new venture.</p></div><div className="venture-stack">{ventures.map(({icon:Icon,...v})=><Link className={"neo-venture "+v.accent} href={v.href} key={v.no}><span className="venture-no">{v.no}</span><div className="venture-icon"><Icon/></div><div className="venture-name"><small>{v.type}</small><h3>{v.name}</h3></div><p>{v.text}</p><div className="venture-state"><i/>{v.state}</div><ChevronRight/></Link>)}</div></section>

  <section className="product-signal"><div className="shell product-grid"><div className="product-copy"><p className="neo-kicker"><Workflow/> PRODUCT SIGNAL / 01</p><h2>SYLA is being rebuilt to make analysis feel immediate.</h2><p>The first GOLIDE SaaS product will bring visualisation, forecasting and file intelligence into one focused workspace.</p><Link className="neo-button solid" href="/projects/syla">See the product story <ArrowRight/></Link><CodePulse/></div><div className="video-console"><div className="console-bar"><span><i/><i/><i/></span><small>SYLA / PRODUCT ARCHIVE</small><strong>01:18</strong></div><video autoPlay muted loop playsInline poster="/syla-card.webp"><source src="https://raw.githubusercontent.com/esiiah/portfolio-site/main/videos/why-syla.mp4" type="video/mp4"/></video><div className="console-overlay"><Play fill="currentColor"/><span>Platform walkthrough</span></div></div></div></section>

  <section className="neo-section shell"><div className="neo-section-head"><div><p className="neo-kicker"><Globe2/> SELECTED OUTPUT</p><h2>Projects that work<br/><span>beyond the thumbnail.</span></h2></div><Link className="neo-text-link" href="/research">All research <ArrowRight/></Link></div><div className="project-deck">{projects.map(p=><Link href={p.href} className="neo-project" key={p.no}><div className="project-media"><Image src={p.image} alt={p.title} fill sizes="(max-width:800px) 100vw, 50vw"/><div className="project-scan"/>{p.video&&<span className="video-pill"><Play fill="currentColor"/> Video inside</span>}</div><div className="project-caption"><span>{p.no}</span><div><small>{p.area}</small><h3>{p.title}</h3></div><MoveUpRight/></div></Link>)}</div></section>

  <section className="founder-window shell"><div className="founder-window-image"><img className="raw-fill" src="/esiah-founder.png?v=20260905" alt="Esiah Kapinga, GOLIDE founder"/></div><div className="founder-window-copy"><p className="neo-kicker"><Beaker/> FOUNDER NODE / LUSAKA</p><h2>Built by someone who refuses to stay in one box.</h2><p>Esiah Kapinga connects microbiology, software development, quality systems, data and digital business into one operating vision.</p><blockquote>Science trains the questions. Technology scales the answer.</blockquote><Link className="neo-button solid" href="/founder">Open full portfolio <ArrowRight/></Link></div></section>

  <section className="journey-showcase">
    <div className="shell journey-showcase-head">
      <div><p className="neo-kicker"><Globe2/> THE ROAD SO FAR</p><h2>Not the finished story.<br/><span>The evidence that it has started.</span></h2></div>
      <div className="journey-showcase-copy">
        <p>Before there is a headline, there is a trail: Chinsanka, school, India, microbiology, laboratories, graduation, quality systems and now GOLIDE.</p>
        <div className="journey-path"><span>ROOTS</span><i>→</i><span>LEARNING</span><i>→</i><span>SCIENCE</span><i>→</i><span>WORK</span><i>→</i><span>BUILDING</span></div>
      </div>
    </div>
    <div className="journey-visual-track" aria-label="GOLIDE founder journey image archive">
      <div className="journey-visual-rail">
        {[1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8].map((n,i)=><div className={"journey-visual frame-"+((i%4)+1)} key={n+"-"+i}><img src={"/experience/e-"+n+".webp?v=20260905"} alt="Founder journey archive"/><div className="journey-glitch"/><span>{String((i%8)+1).padStart(2,"0")}</span></div>)}
      </div>
    </div>
    <div className="shell journey-showcase-foot"><Link className="neo-text-link" href="/founder">Open the full origin story <ArrowRight/></Link><small>THE ROAD CONTINUES / GOLIDE</small></div>
  </section>

  <section className="neo-cta shell"><div><p className="neo-kicker"><CircleDot/> OPEN CHANNEL</p><h2>Build something that earns its place.</h2></div><a className="neo-button invert" href="mailto:esiahkapinga3@gmail.com">Start a conversation <ArrowRight/></a></section><Footer/>
 </main>}