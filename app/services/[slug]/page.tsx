import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProTile } from "@/components/ProTile";
import { ServiceSlideshow } from "@/components/ServiceSlideshow";
import { professionalsForService } from "@/lib/featured-pros";
import { getService, serviceSlideIcons } from "@/lib/services";
import { SITE_EMAIL, SITE_WHATSAPP } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return { title: service?.name ?? "Service" };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const pros = professionalsForService(service.id);

  return (
    <section className="section service-page">
      <p>
        <Link href="/" className="back-link">
          Home
        </Link>
      </p>
      <h1>{service.name}</h1>
      <p className="pro-line">{service.title}</p>
      <p className="hero-line">{service.body}</p>
      <ServiceSlideshow
        name={service.name}
        tagline={service.title}
        slides={serviceSlideIcons[service.id] ?? []}
        order={0}
      />
      <h2>Professionals</h2>
      <div className="tiles">
        {pros.map((pro) => (
          <ProTile key={pro.slug} pro={pro} />
        ))}
      </div>
      <div className="contact-row">
        <a className="contact-btn" href={SITE_WHATSAPP}>
          WhatsApp
        </a>
        <a className="contact-btn" href={`mailto:${SITE_EMAIL}`}>
          Email
        </a>
        <Link className="contact-btn" href="/contact">
          Contact
        </Link>
      </div>
    </section>
  );
}
