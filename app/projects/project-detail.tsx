import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, ExternalLink, Play, Radio } from "lucide-react";
import { Footer, Header } from "../shared";
import { Marquee } from "../kinetic";

export type Project = { index:string; title:string; eyebrow:string; summary:string; image:string; video?:string; tools:string[]; challenge:string; response:string; outcomes:string[]; external?:string; };

export function ProjectDetail({project}:{project:Project}){return <main className="neo-site"><Header/><section className="project-hero shell"><Link href="/#projects" className="back-link"><ArrowLeft/> Back to projects</Link><div className="project-hero-grid"><div><p className="neo-kicker"><Radio/> PROJECT FILE / {project.index}</p><h1>{project.title}</h1><p>{project.summary}</p><div className="tool-cloud">{project.tools.map(t=><span key={t}>{t}</span>)}</div></div><div className="project-hero-media"><Image src={project.image} alt={project.title} fill priority sizes="(max-width:800px) 100vw, 50vw"/><span className="project-code">G/{project.index}</span></div></div></section><Marquee items={project.tools}/>
  {project.video&&<section className="project-video shell"><div className="project-video-copy"><p className="neo-kicker"><Play/> PRODUCT IN MOTION</p><h2>See the system, not just the screenshot.</h2><p>This original project footage is part of the build archive and shows the working interface.</p></div><div className="video-console"><div className="console-bar"><span><i/><i/><i/></span><small>{project.title} / DEMO</small><strong>PLAY</strong></div><video controls playsInline poster={project.image}><source src={project.video} type="video/mp4"/></video></div></section>}
  <section className="case-grid shell"><article><span>01 / Challenge</span><h2>{project.challenge}</h2></article><article><span>02 / Response</span><p>{project.response}</p></article></section>
  <section className="outcome-panel shell"><div><p className="neo-kicker"><CircleDot/> BUILD OUTPUT</p><h2>What the project delivered.</h2></div><div>{project.outcomes.map(o=><p key={o}><CheckCircle2/>{o}</p>)}</div></section>
  <section className="project-next shell"><div><span>Project status</span><strong>{project.external?"Available in archive":"Research archive"}</strong></div>{project.external?<a className="neo-button solid" target="_blank" rel="noreferrer" href={project.external}>Open original build <ExternalLink/></a>:<Link className="neo-button solid" href="/research">Explore research <ArrowRight/></Link>}</section><Footer/></main>}
