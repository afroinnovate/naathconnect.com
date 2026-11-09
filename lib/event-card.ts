import { formatEventTime } from "./time";
import type { EventItem, SessionUser } from "./types";

export type EventCardModel = {
  id: string;
  title: string;
  summary: string;
  body: string | null;
  when: string;
  where: string;
  businessName: string;
  profession: string;
  viewCount: number;
  likeCount: number;
  heartCount: number;
  viewerHasLike: boolean;
  viewerHasHeart: boolean;
  canReact: boolean;
  reactionHint: string | null;
};

export function toEventCard(event: EventItem, session: SessionUser | null, withBody = false): EventCardModel {
  const owns = session?.id === event.professionalId;
  const approvedAccount = session?.status === "approved";
  let reactionHint: string | null = null;
  if (!session) reactionHint = "Sign in with an approved account to react.";
  else if (owns) reactionHint = "You organize this event, so your reaction is not counted.";
  else if (!approvedAccount) reactionHint = "Reactions open once an admin approves your account.";
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    body: withBody ? event.body : null,
    when: formatEventTime(event.startsAt),
    where: event.locationLabel,
    businessName: event.businessName,
    profession: event.profession,
    viewCount: event.viewCount,
    likeCount: event.likeCount,
    heartCount: event.heartCount,
    viewerHasLike: event.viewerHasLike,
    viewerHasHeart: event.viewerHasHeart,
    canReact: Boolean(session && approvedAccount && !owns),
    reactionHint,
  };
}

export function monogram(name: string): string {
  const parts = name.split(/\s+/).filter((part) => part && part.toLowerCase() !== "placeholder");
  const letters = (parts.length ? parts : name.split(/\s+/)).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "NC";
}
