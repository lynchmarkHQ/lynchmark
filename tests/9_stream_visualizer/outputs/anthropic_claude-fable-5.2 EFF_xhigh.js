async function createStreamVisualizer(
  asyncIterable,
  { maxPoints = Infinity, alpha = .5, width = 300, height = 150, yDomain = [0, 1] } = {}
) {
  const { scaleLinear, line } = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
  const data = [];
  let ema;

  for await (const { timestamp, value } of asyncIterable) {
    ema = ema == null ? value : alpha * value + (1 - alpha) * ema;
    data.push({ timestamp, value, ema }) > maxPoints && data.shift();
  }

  if (!data.length) return { data, path: '' };

  const x = scaleLinear([data[0].timestamp, data.at(-1).timestamp], [0, width]);
  const y = scaleLinear(yDomain, [height, 0]);

  return { data, path: line(d => x(d.timestamp), d => y(d.ema))(data) };
}
export default createStreamVisualizer;
// Generation time: 48.624s
// Result: PASS