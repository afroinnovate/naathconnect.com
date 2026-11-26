import type { PublicPro } from "./featured-pros";

const TITLE_ABBREVIATIONS = new Set(["dr", "mr", "mrs", "ms", "prof", "st", "jr", "sr", "vs", "eg", "ie"]);

/** First sentence already in the text. Titles and initials such as "Dr." stay attached. */
export function firstSentence(text: string): { lead: string; rest: string } {
  const trimmed = text.trim();
  for (let i = 0; i < trimmed.length; i++) {
    const mark = trimmed[i];
    if (mark !== "." && mark !== "!" && mark !== "?") continue;
    const next = trimmed[i + 1];
    if (next !== undefined && next !== " " && next !== "\n") continue;
    const word = (trimmed.slice(0, i).split(/\s+/).pop() ?? "").replace(/[(),]/g, "");
    const bare = word.toLowerCase().replace(/\./g, "");
    if (TITLE_ABBREVIATIONS.has(bare) || /^[A-Za-z]$/.test(word)) continue;
    const lead = trimmed.slice(0, i + 1).trim();
    const rest = trimmed.slice(i + 1).trim();
    return { lead, rest };
  }
  return { lead: trimmed, rest: "" };
}

/** Short overview from copy already on the profile. Does not write new text. */
export function profileOverview(pro: PublicPro): { overview: string | null; restBio: string | null; restStatements: readonly string[] } {
  const bio = pro.bio?.trim();
  if (bio) {
    const { lead, rest } = firstSentence(bio);
    return { overview: lead, restBio: rest || null, restStatements: pro.statements ?? [] };
  }
  const statements = pro.statements ?? [];
  if (statements.length > 0) {
    return { overview: statements[0], restBio: null, restStatements: statements.slice(1) };
  }
  const profession = pro.profession?.trim();
  if (profession) return { overview: profession, restBio: null, restStatements: [] };
  return { overview: null, restBio: null, restStatements: [] };
}
