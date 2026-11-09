import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isDemoMode } from "@/lib/config";
import { getSession } from "@/lib/session";
import "./globals.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "700"] });

const themeBoot = `(function(){try{var k="nc-theme";var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Naath Connect", template: "%s · Naath Connect" },
  description: "Naath Connect connects Naath communities and businesses worldwide with local professionals.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={grotesk.variable} suppressHydrationWarning>
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
