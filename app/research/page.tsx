import type { Metadata } from "next";
import Image from "next/image";
import { Beaker, Database, Dna, ExternalLink } from "lucide-react";
import { Footer, Header } from "../shared";

export const metadata: Metadata = { title: "Research", description: "GOLIDE research across public health data, bioinformatics and scientific computing." };

const work = [
  { icon: Database, title: "Malaria facility intelligence", field: "Public health data", image: "/dhis2-card.webp", text: "A DHIS2-style system integrating WHO data with facility monitoring, KPI tracking, quality checks and automated alerting." },
  { icon: Dna, title: "Tinospora phylogenetics", field: "Computational biology", image: "/tinospora.webp", text: "An analysis of genetic relationships and divergence using GenBank sequences, alignment and phylogenetic reconstruction." },
  { icon: Beaker, title: "Child mortality patterns", field: "Global health", image: "/unicef.webp", text: "R-based analysis of UNICEF and World Bank datasets exploring mortality trends, fertility, GDP and regional inequality." },
];

export default function ResearchPage(){return <main><Header/><section className="inner-hero shell"><p className="eyebrow"><span/> GOLIDE Research</p><h1>Evidence should<br/><em>move.</em></h1><p>Research, dashboards and computational work built to move information from static reports into systems people can explore and use.</p></section><section className="research-grid shell">{work.map(({icon:Icon,...item},i)=><article className="research-card" key={item.title}><div className="research-visual"><Image src={item.image} alt={item.title} fill sizes="(max-width: 800px) 100vw, 33vw"/></div><div className="research-body"><div className="research-meta"><span>0{i+1} / {item.field}</span><Icon size={20}/></div><h2>{item.title}</h2><p>{item.text}</p><span className="coming-link">Case study migrating <ExternalLink size={15}/></span></div></article>)}</section><section className="research-note shell"><span>Research direction</span><p>Emerging infectious diseases, structural biology and computational surveillance—connected by one question: how can better information produce earlier, smarter action?</p></section><Footer/></main>}
