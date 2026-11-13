export function ExampleFlow() {
  return (
    <div className="example" aria-label="Illustrative example, not a real listing">
      <p className="example-flag">Example</p>
      <div className="example-stage">
        <div className="ex-search" aria-hidden="true">
          <span>Search</span>
          <strong>tax</strong>
        </div>
        <div className="ex-card" aria-hidden="true">
          <span>Tax</span>
          <strong>Tax service</strong>
          <em>Tap</em>
        </div>
        <div className="ex-phone" aria-hidden="true">
          <span>Phone</span>
          <strong>Connecting on WhatsApp</strong>
        </div>
      </div>
      <p className="example-note">An example of how search works.</p>
    </div>
  );
}
