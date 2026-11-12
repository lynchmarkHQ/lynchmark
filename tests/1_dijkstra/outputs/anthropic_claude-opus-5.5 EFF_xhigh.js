const PQ_URL = 'https://esm.sh/js-priority-queue@0.1.5';
let pqPromise;

const loadPQ = () =>
  (pqPromise ??= import(PQ_URL)
    .then(m => m.default?.default ?? m.default ?? m)
    .catch(e => {
      pqPromise = null;
      throw e;
    }));

const findShortestPath = async (graph, start, end) => {
  const PQ = await loadPQ();
  const [s, t] = [start, end].map(String);
  const dist = new Map([[s, 0]]);
  const q = new PQ({ comparator: (a, b) => a[1] - b[1] });
  q.queue([s, 0]);
  while (q.length) {
    const [n, d] = q.dequeue();
    if (n === t) return d;
    if (d > dist.get(n)) continue;
    for (const [m, w] of Object.entries(graph?.[n] ?? {})) {
      const nd = d + w;
      if (nd < (dist.get(m) ?? Infinity)) dist.set(m, nd), q.queue([m, nd]);
    }
  }
  return Infinity;
};
export default findShortestPath;
// Generation time: 28.375s
// Result: PASS