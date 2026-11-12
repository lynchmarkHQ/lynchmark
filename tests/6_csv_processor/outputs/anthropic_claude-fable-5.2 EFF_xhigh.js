async function processCSV(csv, { filterColumn, filterValue, groupBy, aggregateColumn, operation }) {
  const ops = {
    sum: v => v.reduce((a, b) => a + b, 0),
    avg: v => ops.sum(v) / v.length,
    count: v => v.length
  };
  if (!Object.hasOwn(ops, operation)) throw new TypeError(`Unsupported operation: ${operation}`);

  const [{ default: Papa }, { rollups }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm'),
    import('https://cdn.jsdelivr.net/npm/d3-array@3.2.4/+esm')
  ]);
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

  return rollups(
    data.filter(r => r[filterColumn] == filterValue),
    rows => ops[operation](rows.map(r => +r[aggregateColumn] || 0)),
    r => r[groupBy]
  ).map(([key, result]) => ({ [groupBy]: key, result }));
}
export default processCSV;
// Generation time: 51.339s
// Result: PASS