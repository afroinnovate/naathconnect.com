"use client";

import { useRef } from "react";
import type { EventCardModel } from "@/lib/event-card";
import { EventCard } from "./EventCard";

export function EventSlider({ events }: { events: EventCardModel[] }) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const move = (direction: number) => {
    const node = scroller.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({ left: direction * Math.max(node.clientWidth * 0.8, 240), behavior: reduced ? "auto" : "smooth" });
  };
  return (
    <div>
      <div className="slider-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous events">
          Previous
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next events">
          Next
        </button>
      </div>
      <div className="slider" ref={scroller}>
        {events.map((event) => (
          <div className="slide" key={event.id}>
            <EventCard event={event} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
