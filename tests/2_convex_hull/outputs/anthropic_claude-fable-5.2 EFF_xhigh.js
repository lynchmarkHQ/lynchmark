async function findConvexHull(points) {
  const { default: _ } = await import('https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm');
  const pts = _.sortBy(_.uniqBy(points, p => `${p.x},${p.y}`), ['x', 'y']);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const chain = list => list.reduce((h, p) => {
    while (h.length > 1 && cross(h.at(-2), h.at(-1), p) <= 0) h.pop();
    return h.push(p), h;
  }, []).slice(0, -1);
  return [...chain(pts), ...chain([...pts].reverse())];
}
export default findConvexHull;
// Generation time: 22.555s
// Result: PASS