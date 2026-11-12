const CDN = 'https://esm.sh/'
let libs

const loadLibs = () =>
  libs ??= Promise.all(
    ['smol-toml@1', 'mnemonist@0.39', 'text-table@0.2'].map(p => import(CDN + p))
  ).then(([toml, mn, tt]) => ({
    parse: toml.parse ?? toml.default?.parse,
    Heap: mn.Heap ?? mn.default?.Heap,
    table: tt.default ?? tt
  })).catch(e => {
    libs = null
    throw e
  })

const computeMST = async toml => {
  if (typeof toml !== 'string') throw new TypeError('TOML input must be a string')
  const { parse, Heap, table } = await loadLibs()
  const { edges = [] } = parse(toml)
  if (!Array.isArray(edges)) throw new TypeError('"edges" must be an array of tables')
  const heap = new Heap((a, b) => a.weight - b.weight), parent = new Map, rank = new Map
  edges.forEach((e, i) => {
    const { from, to, weight } = e ?? {}
    if (typeof from !== 'string' || typeof to !== 'string' || !Number.isFinite(weight))
      throw new TypeError(`Invalid edge at index ${i}: expected string "from"/"to" and finite numeric "weight"`)
    for (const v of [from, to]) parent.has(v) || (parent.set(v, v), rank.set(v, 0))
    heap.push({ from, to, weight })
  })
  const find = x => {
    let r = x
    while (parent.get(r) !== r) r = parent.get(r)
    while (x !== r) {
      const next = parent.get(x)
      parent.set(x, r)
      x = next
    }
    return r
  }
  const union = (a, b) => {
    let x = find(a), y = find(b)
    if (x === y) return false
    if (rank.get(x) < rank.get(y)) [x, y] = [y, x]
    parent.set(y, x)
    rank.get(x) === rank.get(y) && rank.set(x, rank.get(x) + 1)
    return true
  }
  const mst = [], target = parent.size - 1
  let totalWeight = 0
  while (heap.size && mst.length < target) {
    const { from, to, weight } = heap.pop()
    if (union(from, to)) mst.push([from, to, String(weight)]), totalWeight += weight
  }
  return { table: table([['From', 'To', 'Weight'], ...mst]), totalWeight }
}
export default computeMST;
// Generation time: 28.662s
// Result: PASS