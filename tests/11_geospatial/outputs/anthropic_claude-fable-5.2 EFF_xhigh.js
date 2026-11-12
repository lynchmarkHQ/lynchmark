async function analyzeGPS(readings, boundary) {
  const { booleanPointInPolygon, lineString, length } = await import(
    'https://cdn.jsdelivr.net/npm/@turf/turf@7/+esm'
  )

  const path = readings
    .filter(({ loc }) => booleanPointInPolygon(loc, boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ loc }) => loc)

  return path.length < 2
    ? 0
    : +length(lineString(path), { units: 'kilometers' }).toFixed(2)
}
export default analyzeGPS;
// Generation time: 9.521s
// Result: PASS