/**
 * Seasonal publishing calendar. A seasonal guide goes live about a month before
 * the season starts, when travellers are booking, not when they are already there.
 *
 * `season` is when the event happens, as a planning range (not a published fact:
 * each guide verifies the year's actual dates before it is written).
 * `draftBy` leaves a week for owner approval before `publishBy`.
 * `path` is the article, or the planned slug for one not yet written.
 * `kind`: "new" is a new article, "refresh" re-verifies an existing seasonal one for the new year.
 */
export type CalendarEntry = {
  topic: string;
  path: string;
  kind: "new" | "refresh";
  season: string;
  draftBy: string;
  publishBy: string;
  note?: string;
};

export const CALENDAR: CalendarEntry[] = [
  {
    topic: "Chuseok 2026: what closes and how to travel that week",
    path: "/korea/chuseok-2026",
    kind: "new",
    season: "2026-09-24 to 2026-09-26",
    draftBy: "2026-09-13",
    publishBy: "2026-09-14",
    note: "Late for the one-month rule; the holiday week is the reason it leads the first batch.",
  },
  {
    topic: "Seoul Lantern Festival 2026",
    path: "/korea/seoul/seoul-lantern-festival",
    kind: "new",
    season: "November 2026 (Cheonggyecheon; confirm dates when announced)",
    draftBy: "2026-10-05",
    publishBy: "2026-10-12",
  },
  {
    topic: "Busan Fireworks Festival 2026",
    path: "/korea/busan/busan-fireworks-festival",
    kind: "new",
    season: "November 2026 (confirm date and paid seating when announced)",
    draftBy: "2026-10-05",
    publishBy: "2026-10-12",
  },
  {
    topic: "Skiing in Korea from Seoul: resorts, shuttle buses, day tours",
    path: "/korea/skiing-in-korea",
    kind: "new",
    season: "December 2026 to February 2027",
    draftBy: "2026-11-01",
    publishBy: "2026-11-08",
  },
  {
    topic: "Christmas in Seoul 2026: markets, lights and what is open",
    path: "/korea/seoul/christmas-in-seoul",
    kind: "new",
    season: "Late November to 25 December 2026",
    draftBy: "2026-10-25",
    publishBy: "2026-11-01",
  },
  {
    topic: "Korea winter festivals 2027: Hwacheon ice fishing and the rest",
    path: "/korea/winter-festivals",
    kind: "new",
    season: "January 2027 (confirm each festival's dates when announced)",
    draftBy: "2026-11-24",
    publishBy: "2026-12-01",
  },
  {
    topic: "Seollal 2027: Lunar New Year closures for travellers",
    path: "/korea/seollal-2027",
    kind: "new",
    season: "February 2027 (confirm official holiday dates)",
    draftBy: "2026-12-31",
    publishBy: "2027-01-07",
  },
  {
    topic: "Cherry blossoms in Korea 2027: forecast dates and where to go",
    path: "/korea/cherry-blossom-2027",
    kind: "new",
    season: "Late March to mid-April 2027",
    draftBy: "2027-02-18",
    publishBy: "2027-02-25",
    note: "Write once the first official bloom forecast is out (usually February); update when the second forecast lands.",
  },
  {
    topic: "Jinhae Gunhangje cherry blossom festival 2027",
    path: "/korea/busan/jinhae-cherry-blossom-festival",
    kind: "new",
    season: "Late March to early April 2027",
    draftBy: "2027-02-22",
    publishBy: "2027-03-01",
  },
  {
    topic: "Korea in the rainy season: July travel",
    path: "/korea/korea-rainy-season",
    kind: "new",
    season: "Late June to late July 2027",
    draftBy: "2027-05-24",
    publishBy: "2027-06-01",
  },
  {
    topic: "Autumn leaves in Korea 2027",
    path: "/korea/autumn-foliage",
    kind: "refresh",
    season: "October to November 2027",
    draftBy: "2027-08-25",
    publishBy: "2027-09-01",
    note: "Re-verify the forecast and change updatedAt only for facts that changed.",
  },
];

/** Entries whose draft is due within the window starting today, earliest first. */
export const upcomingCalendar = (today: string, days: number, entries: CalendarEntry[] = CALENDAR) => {
  const end = new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
  return entries.filter((e) => e.publishBy >= today && e.draftBy <= end).sort((a, b) => a.draftBy.localeCompare(b.draftBy));
};
