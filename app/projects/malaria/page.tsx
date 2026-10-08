import { ProjectDetail, projectMetadata } from "../project-detail";

export const metadata = projectMetadata(
  "malaria",
  "Malaria Surveillance Dashboard for Zambia (DHIS2-Style, WHO GHO API)",
  "A DHIS2-style malaria surveillance dashboard for Zambia: live WHO Global Health Observatory indicators, facility-level trends, data-quality checks and a mean + 2 SD outbreak alert rule.",
  "/dhis2-card.webp",
);

export default function Page(){return <ProjectDetail project={{
  index:"02", slug:"malaria", schemaType:"SoftwareApplication",
  title:"Malaria Intelligence", eyebrow:"Public health surveillance",
  summary:"A DHIS2-style malaria surveillance dashboard for Zambia, connecting live WHO indicators with facility-level exploration, data-quality signals and outbreak-oriented alerting.",
  image:"/dhis2-card.webp", video:"/videos/projects/malaria-demo-full.mp4",
  tools:["JavaScript","DHIS2","WHO GHO API","Chart.js","Leaflet","Tailwind"],
  challenge:"Health data can exist at national level while local teams still lack a fast view of completeness, facility trends and potential outbreak signals.",
  response:"The dashboard brings live national indicators and simulated facility reporting together in one surveillance workspace built around action: KPIs, maps, facility monitoring, data-quality checks and alerting.",
  outcomes:["Live national malaria KPIs from the WHO GHO API","Facility-level KPI and trend exploration","Data completeness and timeliness checks","Automated signals for unusual malaria activity"],
  external:"https://esiiah.github.io/portfolio-site/Dhis2/Dhis2_dashboard.html",
  study:{
    overview:[
      "This project demonstrates malaria surveillance analytics for Zambia in an interface modelled on DHIS2, the health management information system (HMIS) used by ministries of health across Africa.",
      "National indicators load live from the World Health Organization's Global Health Observatory (GHO) API. Because WHO does not publish facility data, facility-level views are simulated from a small local dataset that mimics DHIS2 facility reporting.",
      "The aim is to show how routine health data can become actionable surveillance intelligence, so that a programme officer can move from a national trend to a single facility, check whether reporting is complete, and see when activity crosses an alert threshold.",
    ],
    objectives:[
      "Pull live national malaria indicators for Zambia from the WHO GHO API.",
      "Present national trends as a time series suitable for surveillance review.",
      "Give geographic context with a Zambia map of health facility locations.",
      "Let users explore facility-level trends and mini-profiles.",
      "Demonstrate data-quality monitoring and a simple early-warning rule.",
    ],
    methods:[
      { label:"National data", text:"WHO GHO API, MALARIA_COUNTRY resource filtered to SpatialDim = 'ZMB' (Zambia) and the selected year." },
      { label:"Facility data", text:"A local synthetic JSON file simulating facility-level reporting, used where official facility data is not publicly available." },
      { label:"Visualisation", text:"Chart.js for KPI trends, Leaflet with public GeoJSON for the map, Tailwind for a windowed DHIS2-style analytics workspace." },
      { label:"Data quality", text:"A completeness and timeliness module showing how reporting gaps would be surfaced." },
      { label:"Alert rule", text:"Alert when current test positivity is at or above the mean of the last 12 months plus two standard deviations, a common early-warning threshold in surveillance dashboards." },
    ],
    findingsTitle:"Key features",
    findings:[
      "Live national malaria KPIs: confirmed cases, test positivity and incidence per 1,000.",
      "National time-series chart for monthly trend analysis.",
      "Zambia map context with health facility locations.",
      "Facility Explorer with facility-level trends and profiles.",
      "Data-quality module covering completeness and timeliness.",
      "Client-side outbreak alert using the mean + 2 SD rule.",
      "Lightweight static build: HTML, Tailwind, Chart.js, Leaflet and vanilla JavaScript, with no backend.",
    ],
    limitations:[
      "WHO publishes no official facility-level data, so facility views use demonstration data.",
      "A true district-level choropleth depends on available district GeoJSON.",
      "Alerts and calculations run client-side and are simplified for demonstration.",
      "Next steps: replace the synthetic data with a real DHIS2 export, add district GeoJSON, and move indicator aggregation and alerting server-side for production.",
    ],
    links:[
      { label:"Live dashboard", href:"https://esiiah.github.io/portfolio-site/Dhis2/Dhis2_dashboard.html" },
      { label:"Facility profile view", href:"https://esiiah.github.io/portfolio-site/Dhis2/facility.html" },
      { label:"Source code and README", href:"https://github.com/esiiah/portfolio-site/tree/main/Dhis2" },
      { label:"Video walkthrough on YouTube", href:"https://www.youtube.com/watch?v=wHHDL1n6vRk" },
    ],
  },
}}/>}
