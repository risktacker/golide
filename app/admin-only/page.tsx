import Link from "next/link";
import { Footer, Header } from "../shared";

export const metadata = {
  title: "Admin only — G$LIDE",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <main className="neo-page"><Header/><section className="shell" style={{minHeight:"68vh",display:"grid",placeItems:"center",paddingBlock:120}}><div style={{maxWidth:620,textAlign:"center"}}><p className="neo-kicker">G$LIDE / RESTRICTED</p><h1 style={{fontSize:"clamp(48px,8vw,92px)",lineHeight:.92,letterSpacing:"-.06em",margin:"20px 0"}}>Admin only.</h1><p style={{color:"#91a7b1",fontSize:17,lineHeight:1.65}}>This account can browse G$LIDE, but product publishing and Studio access are restricted to the owner.</p><div className="neo-actions" style={{justifyContent:"center",marginTop:28}}><Link className="neo-button solid" href="https://marketplace.golidee.com/">Browse marketplace</Link><form action="/auth/signout" method="post"><button className="neo-button" type="submit">Use another account</button></form></div></div></section><Footer/></main>;
}
