// Wallet + calendar export helpers (client-only).
// Generates an .ics file the OS recognizes, which iOS/Android use to add to
// Apple Wallet / Google Calendar via the share sheet.

import type { Booking } from "@/data/bookings";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsDate(iso: string): string {
  // YYYYMMDDTHHmmssZ
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(booking: Booking): string {
  const start = new Date(booking.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h block
  const title =
    booking.type === "ticket"
      ? `${booking.eventTitle} @ ${booking.placeName}`
      : `Reservation · ${booking.placeName}`;
  const description =
    booking.type === "ticket"
      ? `Event ticket — ${booking.eventTitle}. Confirmation: ${booking.confirmationCode}`
      : `Table for ${booking.partySize ?? 2}. Confirmation: ${booking.confirmationCode}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VibeCheck//Bookings//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@vibecheck.app`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(start.toISOString())}`,
    `DTEND:${toIcsDate(end.toISOString())}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(booking.placeName)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function safeFile(s: string) {
  return s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

export function downloadIcs(booking: Booking) {
  if (typeof window === "undefined") return;
  const ics = buildIcs(booking);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vibecheck-${safeFile(booking.placeName)}-${booking.confirmationCode}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadAllIcs(bookings: Booking[]) {
  if (typeof window === "undefined" || bookings.length === 0) return;
  const events = bookings.map((b) => {
    const ics = buildIcs(b);
    // strip wrapper to merge events
    return ics
      .split("\r\n")
      .filter(
        (l) =>
          !l.startsWith("BEGIN:VCALENDAR") &&
          !l.startsWith("END:VCALENDAR") &&
          !l.startsWith("VERSION") &&
          !l.startsWith("PRODID") &&
          !l.startsWith("METHOD"),
      )
      .join("\r\n");
  });
  const merged = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VibeCheck//Bookings//EN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([merged], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vibecheck-bookings.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
