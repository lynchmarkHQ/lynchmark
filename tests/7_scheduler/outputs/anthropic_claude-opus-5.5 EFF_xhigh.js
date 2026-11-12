const LUXON_URL = 'https://cdn.jsdelivr.net/npm/luxon@3.5.0/+esm';
const DAY_MINUTES = 1440;

const loadLuxon = (() => {
  let mod;
  return () => (mod ??= import(LUXON_URL).catch(e => {
    mod = undefined;
    throw e;
  }));
})();

const toMinutes = t => {
  const [, h, m] = /^(\d{1,2}):(\d{2})$/.exec(t) ?? [];
  const v = h * 60 + +m;
  if (!h || m > 59 || v > DAY_MINUTES) throw new RangeError(`Invalid work hour "${t}"`);
  return v;
};

const findAvailableSlots = async (calendarA, calendarB, { durationMinutes, searchRange, workHours } = {}) => {
  if (![calendarA, calendarB].every(Array.isArray)) throw new TypeError('Calendars must be arrays');
  const ms = Math.round(durationMinutes * 6e4);
  if (!(ms > 0 && isFinite(ms))) throw new RangeError('durationMinutes must be a positive finite number');
  const ws = toMinutes(workHours?.start);
  const span = (toMinutes(workHours?.end) - ws + DAY_MINUTES) % DAY_MINUTES || DAY_MINUTES;
  const { DateTime, Interval } = await loadLuxon();
  const toInterval = ({ start, end } = {}, label) => {
    const i = Interval.fromDateTimes(...[start, end].map(s => DateTime.fromISO(String(s), { zone: 'utc' })));
    if (!i.isValid) throw new RangeError(`Invalid ${label}: ${i.invalidReason}`);
    return i;
  };
  const range = toInterval(searchRange, 'searchRange');
  const busy = [...calendarA, ...calendarB].map(s => toInterval(s, 'busy slot')).filter(i => !i.isEmpty());
  const windows = [];
  for (let d = range.start.startOf('day').minus({ days: 1 }); d < range.end; d = d.plus({ days: 1 }))
    windows.push(Interval.after(d.plus({ minutes: ws }), { minutes: span }));
  const blocked = Interval.merge([...busy, ...range.difference(...windows)]);
  return range
    .difference(...blocked)
    .flatMap(f => f.splitBy({ milliseconds: ms }).filter(s => s.end - s.start === ms))
    .map(({ start, end }) => ({ start: start.toISO(), end: end.toISO() }));
};
export default findAvailableSlots;
// Generation time: 110.110s
// Result: PASS