import type { Metadata } from "next";
import { Footer, Header } from "../../shared";
import MarketClient from "./market-client";
import { listPublishedProducts } from "./market-data";
import styles from "./market.module.css";

export const metadata: Metadata = {
  title: "Digital Market — G$LIDE",
  description: "A curated marketplace of practical digital toolkits, playbooks and learning systems, delivered through Whop.",
};

type Props = { searchParams: Promise<{ publisher?: string }> };

export default async function Page({ searchParams }: Props) {
  const products = await listPublishedProducts();
  const query = await searchParams;
  const canManage = query.publisher === "1";

  return <main className={styles.marketPage}>
    <Header/>
    <div className={styles.marketShell}>
      <MarketClient products={products} canManage={canManage}/>
    </div>
    <Footer/>
  </main>;
}
