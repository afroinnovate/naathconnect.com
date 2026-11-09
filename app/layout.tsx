import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { allowIndexing, isDemoMode, siteUrl } from "@/lib/config";
import { getSession } from "@/lib/session";
import "./globals.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "700"] });

const themeBoot = `(function(){try{var s=localStorage.getItem("nc-theme");if(s==="light"||s==="dark")document.documentElement.setAttribute("data-theme",s);}catch(e){}})();`;

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const indexing = allowIndexing();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: "Naath Connect", template: "%s · Naath Connect" },
    description: "Naath Connect connects Naath communities and businesses worldwide with local professionals.",
    robots: indexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={grotesk.variable} data-theme="dark" suppressHydrationWarning>
      <body>
        <Script id="nc-theme" strategy="beforeInteractive">
          {themeBoot}
        </Script>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {isDemoMode() ? <DemoBanner /> : null}
        <Header session={session} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
