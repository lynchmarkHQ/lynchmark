async function computeMST(toml) {
  const [{ parse }, mnemonist, { default: table }] = await Promise.all([
    import('https://esm.sh/smol-toml@1'),
    import('https://esm.sh/mnemonist@0.39'),
    import('https://esm.sh/text-table@0.2.0')
  ]);
  const Heap = mnemonist.Heap ?? mnemonist.default.Heap;
  const { edges = [] } = parse(toml);
  const heap = new Heap((a, b) => a.weight - b.weight);
  const parent = new Map();
  const rank = new Map();

  const find = node => {
    const up = parent.get(node);
    if (up === node) return node;
    const root = find(up);
    parent.set(node, root);
    return root;
  };

  const union = (a, b) => {
    let x = find(a), y = find(b);
    if (x === y) return false;
    if (rank.get(x) < rank.get(y)) [x, y] = [y, x];
    parent.set(y, x);
    if (rank.get(x) === rank.get(y)) rank.set(x, rank.get(x) + 1);
    return true;
  };

  for (const edge of edges) {
    if (!Number.isFinite(edge.weight)) throw new TypeError(`Invalid edge weight: ${edge.weight}`);
    heap.push(edge);
    for (const node of [edge.from, edge.to]) {
      parent.set(node, node);
      rank.set(node, 0);
    }
  }

  const rows = [['From', 'To', 'Weight']];
  let totalWeight = 0;

  while (heap.size && rows.length < parent.size) {
    const { from, to, weight } = heap.pop();
    if (!union(from, to)) continue;
    rows.push([from, to, String(weight)]);
    totalWeight += weight;
  }

  return { table: table(rows), totalWeight };
}
export default computeMST;
// Generation time: 93.401s
// Result: PASS