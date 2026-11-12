async function findAvailableSlots(calendarA = [], calendarB = [], { durationMinutes, searchRange, workHours }) {
  const { DateTime } = await import('https://cdn.jsdelivr.net/npm/luxon@3.4.4/+esm');
  const MINUTE = 6e4;
  const DAY = 864e5;
  const utc = { zone: 'utc' };
  const toMs = iso => DateTime.fromISO(iso, utc).toMillis();
  const toIso = ms => DateTime.fromMillis(ms, utc).toISO();
  const dayStart = ms => DateTime.fromMillis(ms, utc).startOf('day').toMillis();
  const toOffset = hhmm => {
    const [h, m = 0] = hhmm.split(':').map(Number);
    return (h * 60 + m) * MINUTE;
  };

  const step = durationMinutes * MINUTE;
  const [rangeStart, rangeEnd] = [searchRange.start, searchRange.end].map(toMs);
  const [workStart, workEnd] = [workHours.start, workHours.end].map(toOffset);
  if (!(step > 0 && rangeStart < rangeEnd && workStart < workEnd)) return [];

  const busy = [...calendarA, ...calendarB]
    .map(({ start, end }) => [toMs(start), toMs(end)])
    .filter(([s, e]) => s < e && e > rangeStart && s < rangeEnd)
    .sort(([a], [b]) => a - b)
    .reduce((merged, [s, e]) => {
      const last = merged.at(-1);
      last && s <= last[1] ? (last[1] = Math.max(last[1], e)) : merged.push([s, e]);
      return merged;
    }, []);

  const free = [];
  let cursor = rangeStart;
  for (const [s, e] of [...busy, [rangeEnd, rangeEnd]]) {
    s > cursor && free.push([cursor, s]);
    cursor = Math.max(cursor, e);
  }

  return free.flatMap(([from, to]) => {
    const slots = [];
    for (let day = dayStart(from); day < to; day += DAY) {
      const end = Math.min(to, day + workEnd);
      for (let t = Math.max(from, day + workStart); t + step <= end; t += step) {
        slots.push({ start: toIso(t), end: toIso(t + step) });
      }
    }
    return slots;
  });
}
export default findAvailableSlots;
// Generation time: 118.604s
// Result: PASS