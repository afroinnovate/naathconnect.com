"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { recordViewAction, toggleReactionAction } from "@/app/actions";
import { monogram, type EventCardModel } from "@/lib/event-card";

export function EventCard({ event, compact = false }: { event: EventCardModel; compact?: boolean }) {
  const [viewCount, setViewCount] = useState(event.viewCount);
  const [likeCount, setLikeCount] = useState(event.likeCount);
  const [heartCount, setHeartCount] = useState(event.heartCount);
  const [liked, setLiked] = useState(event.viewerHasLike);
  const [hearted, setHearted] = useState(event.viewerHasHeart);
  const [message, setMessage] = useState<string | null>(null);
  const seen = useRef(false);
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setViewCount(event.viewCount);
    setLikeCount(event.likeCount);
    setHeartCount(event.heartCount);
    setLiked(event.viewerHasLike);
    setHearted(event.viewerHasHeart);
  }, [event]);

  useEffect(() => {
    const node = root.current;
    if (!node || seen.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || seen.current) return;
        seen.current = true;
        void recordViewAction(event.id).then((result) => setViewCount(result.viewCount));
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [event.id]);

  async function react(kind: "like" | "heart") {
    setMessage(null);
    const result = await toggleReactionAction(event.id, kind);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setLikeCount(result.likeCount);
    setHeartCount(result.heartCount);
    setLiked(result.viewerHasLike);
    setHearted(result.viewerHasHeart);
  }

  return (
    <article className="event-card" ref={root}>
      <div className="event-top">
        <span className="monogram" aria-hidden="true">
          {monogram(event.businessName)}
        </span>
        <div>
          <p className="who">{event.businessName}</p>
          <p className="quiet">{event.profession}</p>
        </div>
      </div>
      <h3>
        <Link href={`/events/${event.id}`}>{event.title}</Link>
      </h3>
      <p>{event.summary}</p>
      {event.body ? <p>{event.body}</p> : null}
      <p className="quiet">
        {event.when}
        <br />
        {event.where}
      </p>
      <div className="event-actions">
        <span className="quiet">{viewCount === 1 ? "1 view" : `${viewCount} views`}</span>
        <ReactionButton
          label="Like"
          count={likeCount}
          pressed={liked}
          canReact={event.canReact}
          href={`/login?next=/events/${event.id}`}
          onClick={() => react("like")}
          icon="like"
        />
        <ReactionButton
          label="Heart"
          count={heartCount}
          pressed={hearted}
          canReact={event.canReact}
          href={`/login?next=/events/${event.id}`}
          onClick={() => react("heart")}
          icon="heart"
        />
      </div>
      {message ? <p className="quiet">{message}</p> : null}
      {!compact && event.reactionHint ? <p className="quiet">{event.reactionHint}</p> : null}
    </article>
  );
}

function ReactionButton({
  label,
  count,
  pressed,
  canReact,
  href,
  onClick,
  icon,
}: {
  label: string;
  count: number;
  pressed: boolean;
  canReact: boolean;
  href: string;
  onClick: () => void;
  icon: "like" | "heart";
}) {
  const content = (
    <>
      {icon === "heart" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z"
            fill={pressed ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 11v9H4v-9h3zm3 9V10l5-5 1 1-1 4h5v3l-2 6H10z" fill="currentColor" />
        </svg>
      )}
      {label} · {count}
    </>
  );
  if (!canReact) {
    return (
      <Link className="reaction" href={href}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className="reaction" aria-pressed={pressed} onClick={onClick}>
      {content}
    </button>
  );
}
