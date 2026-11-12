async function findShortestPath(graph, start, end) {
  const { default: PriorityQueue } = await import('https://esm.sh/js-priority-queue@0.1.5')
  const [source, target] = [start, end].map(String)
  const dist = new Map([[source, 0]])
  const queue = new PriorityQueue({
    comparator: (a, b) => a[0] - b[0],
    initialValues: [[0, source]]
  })

  while (queue.length) {
    const [d, node] = queue.dequeue()
    if (node === target) return d
    if (d > dist.get(node)) continue

    for (const [next, weight] of Object.entries(graph[node] ?? {})) {
      const total = d + weight
      if (total < (dist.get(next) ?? Infinity)) {
        dist.set(next, total)
        queue.queue([total, next])
      }
    }
  }

  return Infinity
}
export default findShortestPath;
// Generation time: 67.040s
// Result: PASS