import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serviceOffers, serviceSlideIcons } from "../lib/services";

const jargon = [/kubernetes/i, /gitops/i, /devops/i, /tailwind/i, /remix/i, /typescript/i, /\bapi\b/i, /ci\/cd/i, /vector/i, /infrastructure as code/i];

describe("service headlines", () => {
  it("keeps technical terms out of the benefit-led titles", () => {
    for (const service of serviceOffers) {
      for (const pattern of jargon) {
        assert.doesNotMatch(service.title, pattern, service.id);
      }
      assert.match(service.title, /\.$/);
      assert.ok(service.body.length > 40, service.id);
      assert.match(service.hood, /./);
    }
  });

  it("keeps the credibility lines for systems and web work", () => {
    const hoods = serviceOffers.map((service) => service.hood).join(" ");
    assert.match(hoods, /Kubernetes/);
    assert.match(hoods, /Remix/);
    assert.match(serviceOffers.find((service) => service.id === "ai-assistants")!.body, /truckers/);
    assert.match(serviceOffers.find((service) => service.id === "websites")!.body, /free website/i);
  });

  it("gives every service a short icon slideshow and no photos", () => {
    for (const service of serviceOffers) {
      const slides = serviceSlideIcons[service.id];
      assert.ok(slides, service.id);
      assert.ok(slides.length >= 3 && slides.length <= 4, service.id);
      for (const icon of slides) {
        assert.match(icon, /^[a-z]+$/);
      }
    }
  });
});
