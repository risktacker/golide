import { ProjectDetail, projectMetadata } from "../project-detail";

export const metadata = projectMetadata(
  "syla",
  "SYLA Analytics: AI Data Visualisation and Forecasting Platform",
  "SYLA Analytics turns CSV and Excel files into automatic charts, plain-English AI forecasts (GPT-4o-mini + Prophet) and file conversions. Product story, features and architecture.",
  "/syla-card.webp",
);

export default function Page(){return <ProjectDetail project={{
  index:"01", slug:"syla", schemaType:"SoftwareApplication",
  title:"SYLA Analytics", eyebrow:"AI analytics platform",
  summary:"An AI-powered platform that turns raw CSV and Excel files into visualisations, plain-English forecasts and clear explanations, without a complicated analytics workflow.",
  image:"/syla-card.webp", video:"/videos/projects/syla-demo-full.mp4",
  tools:["React","FastAPI","GPT-4o-mini","Prophet","PostgreSQL","Chart.js"],
  challenge:"Useful analysis often gets trapped behind technical setup, repetitive cleaning and tools that assume specialist knowledge.",
  response:"SYLA combined automated chart generation, natural-language forecasting and file conversion into one accessible product experience.",
  outcomes:["Automated chart generation from uploaded data","Natural-language forecasting workflows","Multiple document and tabular file conversions","A full-stack product architecture ready for its next rebuild"],
  external:"https://github.com/esiiah/syla-backend",
  study:{
    overview:[
      "SYLA Analytics is an AI-powered data platform that automates chart generation, provides natural-language forecasting and offers file conversion tools. It was built with React, FastAPI and OpenAI models to remove the manual work of turning a spreadsheet into charts and a report.",
      "The first version was built and demonstrated end to end. SYLA is now being rebuilt as GOLIDE's first SaaS product, and this page documents the original build.",
    ],
    objectivesTitle:"The problem",
    objectives:[
      "Popular analysis tools require manual chart creation for every dataset.",
      "Reports cannot be generated automatically from raw data.",
      "Forecasting requires specialised statistical knowledge.",
      "Enterprise analytics tools are expensive and slow to set up.",
      "File-format conversion is a repetitive, time-consuming chore.",
    ],
    methods:[
      { label:"Frontend", text:"React 18, Chart.js, TailwindCSS and Vite." },
      { label:"Backend", text:"Python 3.11+, FastAPI, Pandas and Prophet." },
      { label:"AI models", text:"OpenAI GPT-4o-mini for natural-language scenarios, combined with Prophet time-series models." },
      { label:"Database", text:"PostgreSQL with SQLAlchemy ORM." },
      { label:"Authentication", text:"JWT tokens and Google OAuth 2.0." },
      { label:"Deployment", text:"AWS: EC2, IAM, VPC and Aurora/RDS." },
    ],
    findingsTitle:"How it works",
    findings:[
      "Upload: drag and drop a CSV or Excel file of up to 10 MB.",
      "Auto-process: SYLA cleans the data, detects column types and generates summary statistics.",
      "Visualise: bar, line, pie, scatter and area charts are generated automatically, with customisable options.",
      "Forecast: describe a scenario in plain English, such as '15% marketing increase next quarter', and get a forecast with 95% confidence intervals from a hybrid GPT + Prophet model.",
      "Convert: move between PDF, Excel, CSV and Word, merge up to 15 PDFs, and compress files at three levels.",
      "Export: download charts as PNG, SVG or PDF, or integrate through a REST API with OpenAPI documentation.",
    ],
    applications:[
      "Business analytics: sales forecasting, revenue trends and customer analysis.",
      "Healthcare: patient data visualisation, epidemic modelling and resource planning.",
      "Finance: portfolio analysis and risk assessment.",
      "E-commerce: demand forecasting, inventory planning and conversion tracking.",
      "Education: student performance tracking and enrolment predictions.",
    ],
    limitationsTitle:"Results and rebuild",
    limitations:[
      "Reported for the original build: chart creation time cut from about 5 minutes to about 15 seconds.",
      "Reported for the original build: 85-95% forecast accuracy for short-term predictions (1-12 periods ahead).",
      "Files of up to 10 MB with 100,000+ rows handled efficiently.",
      "The rebuild focuses the product on visualisation, forecasting and file intelligence in one workspace.",
    ],
    links:[
      { label:"Backend source code", href:"https://github.com/esiiah/syla-backend" },
      { label:"Original project page", href:"https://esiiah.github.io/portfolio-site/sylaanalytics.html" },
      { label:"Demo on YouTube", href:"https://www.youtube.com/watch?v=h7PFUG-N0Og" },
    ],
  },
}}/>}
