"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ServiceIcon } from "./ServiceIcon";

const HOLD_MS = 2800;

export function ServiceSlideshow({
  name,
  tagline,
  slides,
  order,
  href,
}: {
  name: string;
  tagline: string;
  slides: readonly string[];
  order: number;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => motion.matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduced()) {
          setPlaying(false);
          setActive(0);
          return;
        }
        setPlaying(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    const onMotion = () => {
      if (motion.matches) {
        setPlaying(false);
        setActive(0);
      }
    };
    motion.addEventListener("change", onMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    let interval = 0;
    const start = window.setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
      interval = window.setInterval(() => {
        setActive((current) => (current + 1) % slides.length);
      }, HOLD_MS);
    }, 500 + (order % 8) * 360);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [playing, order, slides.length]);

  const card = (
    <div ref={ref} className="service-card" data-slide={active}>
      <div className="service-stage" aria-hidden="true">
        {slides.map((icon, index) => (
          <div key={`${icon}-${index}`} className={index === active ? "service-slide is-on" : "service-slide"}>
            <ServiceIcon name={icon} />
          </div>
        ))}
      </div>
      <p className="service-caption">
        <strong>{name}</strong>
        <span>{tagline}</span>
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="service-card-link">
        {card}
      </Link>
    );
  }
  return card;
}
