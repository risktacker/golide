import { ProjectDetail, projectMetadata } from "../project-detail";

const VIEWS = "https://esiiah.github.io/portfolio-site/unicef-ssa-child-mortality";

export const metadata = projectMetadata(
  "child-mortality",
  "Child Mortality in Sub-Saharan Africa: UNICEF Data Analysis in R",
  "R analysis of UNICEF and World Bank data on under-five, infant and neonatal mortality across Sub-Saharan Africa, 2000 onward, with interactive maps, trends and GDP and fertility comparisons.",
  "/unicef.webp",
);

export default function Page(){return <ProjectDetail project={{
  index:"04", slug:"child-mortality", schemaType:"ScholarlyArticle",
  title:"Child Mortality Patterns", eyebrow:"Global health analytics",
  summary:"An R-based analysis of under-five, infant and neonatal mortality across Sub-Saharan Africa, connecting UNICEF trends with World Bank fertility and economic indicators.",
  image:"/unicef.webp",
  tools:["R","dplyr","tidyr","ggplot2","readr","lubridate","UNICEF","World Bank"],
  challenge:"Regional averages can hide the countries, periods and socioeconomic conditions where children remain most at risk.",
  response:"UNICEF and World Bank datasets were cleaned, harmonised and joined in R, then turned into interactive trends, maps, rankings and comparisons.",
  outcomes:["Long-term neonatal, infant and under-five mortality trends","Country and regional comparisons across Sub-Saharan Africa","Interactive maps, heatmaps and a 41,832-row data table","GDP and fertility relationship exploration"],
  external:"https://esiiah.github.io/portfolio-site/unicef-mortality.html",
  study:{
    overview:[
      "This project explores historical and recent trends in under-five child mortality across Sub-Saharan African countries, using data from UNICEF's Data Warehouse and World Bank indicators.",
      "It applies data wrangling and visualisation techniques in R to reveal disparities between countries, assess progress toward Sustainable Development Goal target 3.2 (ending preventable deaths of newborns and children under five), and point to where interventions matter most.",
      "Mortality indicators are analysed alongside fertility and GDP per capita so that the patterns can be read in their demographic and economic context rather than as isolated numbers.",
    ],
    objectives:[
      "Import and clean UNICEF child mortality datasets using readr, tidyr and dplyr.",
      "Harmonise under-five (U5MR), infant (IMR) and neonatal mortality indicators.",
      "Segment the analysis by region, country and income group.",
      "Track trends from 2000 onward.",
      "Visualise disparities with ggplot2 and interactive charts.",
      "Generate insights for development strategy.",
    ],
    table:{ caption:"Data sources", head:["Source","Description"], rows:[
      ["UNICEF Data Warehouse","Official child mortality data: U5MR, IMR and neonatal mortality"],
      ["World Bank","GDP per capita, health access and fertility overlays"],
      ["UN region codes","Country mapping to Sub-Saharan Africa"],
    ]},
    methods:[
      { label:"Key variables", text:"Country, Year, U5MR, IMR, Neonatal_Mortality, Births, Deaths and Region." },
      { label:"Data cleaning", text:"Imported with read_csv(), standardised with clean_names(), filtered to Sub-Saharan African countries and cleared of missing values." },
      { label:"Wrangling", text:"Grouped by country and year, calculated rate reductions and merged GDP and fertility overlays." },
      { label:"Visualisation", text:"Time series, rankings and heatmaps plotted with ggplot2, with interactive versions for maps, scatter plots and tables. Rates follow UNICEF/UN definitions and are expressed per 1,000 live births." },
    ],
    findings:[
      "Under-five mortality in Sub-Saharan Africa declined from 145 per 1,000 live births in 2000 to 72 per 1,000 in 2022.",
      "Nigeria carries the highest burden, with only a modest decline.",
      "Ethiopia achieved a drop of more than 60%, linked to immunisation and improved access to care.",
      "Progress stagnated in conflict-affected countries such as South Sudan.",
      "High fertility and low GDP per capita correlate with poorer child survival.",
    ],
    applications:[
      "Public health planning in Sub-Saharan Africa.",
      "Monitoring progress toward SDG 3.2.",
      "Prioritising maternal and child health investment.",
      "Academic research and teaching.",
    ],
    links:[
      { label:"Under-five mortality trend, 2000-2025", href:`${VIEWS}/trendline_folder/U5MR_Trend_Interactive.html`, note:"Progress toward SDG 3.2 targets" },
      { label:"Under-five mortality map", href:`${VIEWS}/maps-mr/maps-index.html`, note:"Geographic distribution per 1,000 live births" },
      { label:"Mortality heatmap", href:`${VIEWS}/heatmap/heatmap-index.html`, note:"Under-five, infant and neonatal rates by country and year" },
      { label:"Under-five mortality vs GDP per capita (2023)", href:`${VIEWS}/u5mr-vs-gdp/u5mr-vs-gdp-dot-index.html` },
      { label:"Neonatal mortality vs fertility rate", href:`${VIEWS}/nm-vs-fr/nm-vs-fr-dot-index.html` },
      { label:"Top 10 fertility rates (2021)", href:`${VIEWS}/bar-chart-fr/ifr-bar-index.html` },
      { label:"Top 10 GDP per capita (2021)", href:`${VIEWS}/bar-chart-GDP/gdp-bar-index.html` },
      { label:"Full data table", href:`${VIEWS}/table-mr/table-index.html`, note:"41,832 entries" },
      { label:"Download the CSV files (ZIP)", href:`${VIEWS}/unicef-csv-files.zip` },
    ],
  },
}}/>}
