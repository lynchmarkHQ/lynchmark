async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation } = {}) {
  const ops = { __proto__: null, sum: s => s, avg: (s, n) => s / n, count: (_, n) => n };
  const reduce = ops[operation];
  if (typeof csv != 'string') throw new TypeError('CSV input must be a string');
  if (!reduce) throw new RangeError(`Unsupported operation: ${operation}`);
  const [{ default: Papa }, { rollups, sum }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/d3-array@3.2.4/+esm')
  ]);
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim() });
  return rollups(
    data.filter(r => r[filterColumn] == filterValue),
    g => reduce(sum(g, r => +r[aggregateColumn] || 0), g.length),
    r => r[groupBy]
  ).map(([k, result]) => ({ [groupBy]: k, result }));
}
export default processCSV;
// Generation time: 70.669s
// Result: PASS