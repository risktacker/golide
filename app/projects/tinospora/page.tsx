import { ProjectDetail, projectMetadata } from "../project-detail";

export const metadata = projectMetadata(
  "tinospora",
  "Tinospora Phylogenetics: rbcL Analysis of Menispermaceae",
  "Phylogenetic analysis of six Menispermaceae taxa, including Tinospora cordifolia, T. sinensis and T. crispa, using chloroplast rbcL sequences, Maximum Likelihood and Neighbor-Joining trees in MEGA12.",
  "/tinospora.webp",
);

export default function Page(){return <ProjectDetail project={{
  index:"03", slug:"tinospora", schemaType:"ScholarlyArticle",
  title:"Tinospora Phylogenetics", eyebrow:"Computational biology",
  summary:"A phylogenetic analysis of Tinospora species and related Menispermaceae taxa, using chloroplast rbcL sequences from GenBank to clarify evolutionary divergence and relatedness.",
  image:"/tinospora.webp",
  tools:["MEGA12","GenBank","BLASTn","ClustalW","Maximum Likelihood","Neighbor-Joining"],
  challenge:"Closely related medicinal plant species require sequence-level comparison to clarify genetic relationships that morphology alone may not resolve.",
  response:"Chloroplast rbcL sequences for six taxa were retrieved from GenBank, verified, aligned and used to build Maximum Likelihood and Neighbor-Joining trees with 1,000 bootstrap replicates.",
  outcomes:["Curated rbcL sequence set for six Menispermaceae taxa","Multiple sequence alignment in MEGA12 (ClustalW)","Maximum Likelihood (JTT) and Neighbor-Joining (Poisson) phylogenies","Bootstrap-supported interpretation of clades and divergence"],
  external:"https://esiiah.github.io/portfolio-site/tinospora-project.html",
  study:{
    overview:[
      "This project investigates the phylogenetic relationships among six species, including Tinospora spp., Paratinospora sagittata and Menispermum dauricum, using chloroplast rbcL gene sequences sourced from GenBank.",
      "These species belong to the family Menispermaceae and are of medicinal and ecological importance. Tinospora cordifolia (giloy), in particular, is widely studied for its bioactive compounds, which makes accurate species identification and an understanding of relatedness within the genus practically useful.",
      "The analysis uses amino acid-based phylogenetic inference to clarify evolutionary divergence and relatedness, comparing two independent tree-building methods so that the conclusions do not rest on a single model.",
    ],
    objectives:[
      "Retrieve and curate rbcL chloroplast sequences from GenBank for six target taxa.",
      "Perform multiple sequence alignment and cleaning to ensure comparability.",
      "Construct phylogenetic trees using Maximum Likelihood (ML) and Neighbor-Joining (NJ) methods.",
      "Interpret clade formation and divergence levels in relation to taxonomic relationships.",
    ],
    table:{ caption:"Target species and GenBank accessions", head:["Species","Accession","Gene"], rows:[
      ["Tinospora cordifolia","MT834944.1","rbcL"],
      ["Tinospora sinensis","PV747743.1","rbcL"],
      ["Tinospora crispa","LC744922.1","rbcL"],
      ["Tinospora baenzigeri","KY365708.1","rbcL"],
      ["Paratinospora sagittata","OQ579165.1","rbcL"],
      ["Menispermum dauricum","OP271868.1","rbcL"],
    ]},
    methods:[
      { label:"Sequence retrieval", text:"rbcL sequences were downloaded from GenBank and verified with BLASTn." },
      { label:"Multiple sequence alignment", text:"Performed with the ClustalW module in MEGA12." },
      { label:"Model selection", text:"The Jones-Taylor-Thornton (JTT) model was used for Maximum Likelihood; the Poisson correction method for Neighbor-Joining." },
      { label:"Tree construction", text:"ML and NJ phylogenies were generated with 1,000 bootstrap replicates. The final dataset comprised 6 amino acid sequences and 1,449 positions." },
      { label:"Interpretation", text:"Bootstrap support values were used to assess the reliability of each clade." },
    ],
    findingsTitle:"Results",
    findings:[
      "T. cordifolia and T. sinensis clustered together with 99% bootstrap support.",
      "T. crispa grouped with T. baenzigeri at 90% support.",
      "Paratinospora sagittata formed a sister group to the Tinospora clade.",
      "Menispermum dauricum diverged earliest among the taxa studied.",
      "The Maximum Likelihood tree with the highest log likelihood was -4,626.27; the optimal Neighbor-Joining tree had a sum of branch length of 0.033.",
    ],
    figures:[
      { src:"/projects/tinospora/phylo-ml.png", alt:"Maximum Likelihood phylogenetic tree of six Tinospora and Menispermaceae taxa based on rbcL", caption:"Maximum Likelihood tree (JTT model). Highest log likelihood -4,626.27; 6 amino acid sequences, 1,449 positions; analysed in MEGA12." },
      { src:"/projects/tinospora/phylo-nj.png", alt:"Neighbor-Joining phylogenetic tree of six Tinospora and Menispermaceae taxa based on rbcL", caption:"Neighbor-Joining tree (Poisson correction). Sum of branch length 0.033; pairwise deletion; 1,449 positions; analysed in MEGA12." },
    ],
    applications:[
      "Improves taxonomic clarity within Tinospora and related genera.",
      "Supports conservation efforts by identifying genetically distinct lineages.",
      "Informs medicinal plant research by linking phylogeny to bioactive compound diversity.",
    ],
    links:[
      { label:"Original project page", href:"https://esiiah.github.io/portfolio-site/tinospora-project.html" },
      { label:"Source repository", href:"https://github.com/esiiah/portfolio-site" },
    ],
    references:[
      "Jones D.T., Taylor W.R. and Thornton J.M. (1992). The rapid generation of mutation data matrices from protein sequences. Computer Applications in the Biosciences 8: 275-282.",
      "Saitou N. and Nei M. (1987). The neighbor-joining method: a new method for reconstructing phylogenetic trees. Molecular Biology and Evolution 4: 406-425.",
      "Zuckerkandl E. and Pauling L. (1965). Evolutionary divergence and convergence in proteins. In Evolving Genes and Proteins, ed. V. Bryson and H.J. Vogel, pp. 97-166. Academic Press, New York.",
      "Kumar S., Stecher G., Suleski M., Sanderford M., Sharma S. and Tamura K. (2024). Molecular Evolutionary Genetics Analysis Version 12 for adaptive and green computing. Molecular Biology and Evolution 41: 1-9.",
    ],
  },
}}/>}
