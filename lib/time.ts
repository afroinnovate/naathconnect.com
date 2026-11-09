export const EVENT_TIME_ZONE = "America/Chicago";

export function zonedLocalToUtc(local: string, timeZone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!match) throw new Error("Use a date and time.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error("Use a date and time.");
  }

  let utc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  for (let i = 0; i < 3; i += 1) {
    const parts = formatter.formatToParts(new Date(utc));
    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") map[part.type] = part.value;
    }
    let wallHour = Number(map.hour);
    if (wallHour === 24) wallHour = 0;
    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      wallHour,
      Number(map.minute),
      Number(map.second),
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute);
    const diff = desired - asUtc;
    if (diff === 0) break;
    utc += diff;
  }

  return new Date(utc);
}

export function formatEventTime(iso: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
  return `${formatted} Central time`;
}

export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
