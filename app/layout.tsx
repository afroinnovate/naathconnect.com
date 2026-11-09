import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isDemoMode } from "@/lib/config";
import { getSession } from "@/lib/session";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source", weight: ["400", "600", "700"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Naath Connect", template: "%s · Naath Connect" },
  description:
    "Naath Connect LLC connects the community with local professional services. Technology consulting in plain language, a community directory, and approved events.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
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
