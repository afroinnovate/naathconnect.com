import { serviceOffers } from "@/lib/services";

export function ServiceList() {
  return (
    <div id="services">
      <h2>How that help shows up</h2>
      <p className="lede">
        Build. Solve. Deploy. Make an impact. These are the services, in plain language. They are offers, not a client
        list and not a quote.
      </p>
      <ol className="service-list">
        {serviceOffers.map((service) => (
          <li key={service.id}>
            <p className="service-name">{service.name}</p>
            <h3>{service.title}</h3>
            <p>{service.body}</p>
            <p className="hood">Under the hood: {service.hood}</p>
          </li>
        ))}
      </ol>
      <p className="offer-note">
        Scope, timing, and what “free” includes — including who registers a domain — are confirmed with Naath Connect
        before any work starts.
      </p>
    </div>
  );
}
