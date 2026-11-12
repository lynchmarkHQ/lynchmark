const TURF_URL = 'https://cdn.jsdelivr.net/npm/@turf/turf@7/+esm'

const analyzeGPS = async (readings = [], boundary) => {
  const t = await import(TURF_URL)
  const path = readings
    .filter(({ loc }) => t.booleanPointInPolygon(loc, boundary, { ignoreBoundary: true }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ loc }) => loc)
  return path.length < 2
    ? 0
    : Math.round(t.length(t.lineString(path), { units: 'kilometers' }) * 100) / 100
}
export default analyzeGPS;
// Generation time: 11.746s
// Result: PASS