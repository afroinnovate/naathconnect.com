import { deleteTestimonialAction, saveTestimonialAction } from "@/app/actions";
import type { Testimonial } from "@/lib/types";

export function Testimonials({
  items,
  canEdit,
  profileId,
  notice,
}: {
  items: Testimonial[];
  canEdit: boolean;
  profileId: string;
  notice?: string;
}) {
  return (
    <section className="section testimonials">
      <h2>Testimonials</h2>
      {notice === "saved" ? <p className="notice">Saved.</p> : null}
      {notice === "unavailable" ? <p className="notice">Testimonials are not available yet.</p> : null}
      {notice === "invalid" ? <p className="notice">Add a quote and a client name.</p> : null}
      {items.length === 0 ? <p className="hero-line">No testimonials yet</p> : null}
      <ul className="testimonial-list">
        {items.map((item) => (
          <li key={item.id}>
            <blockquote>{item.quote}</blockquote>
            <p>
              <strong>{item.clientName}</strong>
              {item.clientRole ? ` · ${item.clientRole}` : ""}
              {item.givenOn ? ` · ${item.givenOn}` : ""}
            </p>
            {canEdit ? (
              <form action={saveTestimonialAction} className="testimonial-form">
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="id" value={item.id} />
                <label>
                  Quote
                  <textarea name="quote" required maxLength={600} defaultValue={item.quote} />
                </label>
                <label>
                  Client name
                  <input name="clientName" required maxLength={120} defaultValue={item.clientName} />
                </label>
                <label>
                  Role
                  <input name="clientRole" maxLength={80} defaultValue={item.clientRole ?? ""} />
                </label>
                <label>
                  Date
                  <input name="givenOn" type="date" defaultValue={item.givenOn ?? ""} />
                </label>
                <button type="submit">Save testimonial</button>
              </form>
            ) : null}
            {canEdit ? (
              <form action={deleteTestimonialAction}>
                <input type="hidden" name="profileId" value={profileId} />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="button-secondary">
                  Delete
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      {canEdit ? (
        <form action={saveTestimonialAction} className="testimonial-form">
          <input type="hidden" name="profileId" value={profileId} />
          <label>
            Quote
            <textarea name="quote" required maxLength={600} />
          </label>
          <label>
            Client name
            <input name="clientName" required maxLength={120} />
          </label>
          <label>
            Role
            <input name="clientRole" maxLength={80} />
          </label>
          <label>
            Date
            <input name="givenOn" type="date" />
          </label>
          <button type="submit">Add testimonial</button>
        </form>
      ) : null}
    </section>
  );
}
