const D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

export async function createStreamVisualizer(source, {
  maxPoints = 100,
  alpha = 0.3,
  width = 600,
  height = 300,
  yDomain = [0, 1]
} = {}) {
  if (typeof source?.[Symbol.asyncIterator] !== 'function' && typeof source?.[Symbol.iterator] !== 'function')
    throw new TypeError('source must be an async iterable')
  if (!Number.isInteger(maxPoints) || maxPoints < 1)
    throw new RangeError('maxPoints must be a positive integer')
  if (!(alpha > 0 && alpha <= 1))
    throw new RangeError('alpha must be in (0, 1]')
  if (![width, height].every(n => Number.isFinite(n) && n > 0))
    throw new RangeError('width and height must be positive numbers')
  if (!Array.isArray(yDomain) || yDomain.length !== 2 || !yDomain.every(Number.isFinite))
    throw new TypeError('yDomain must be [min, max]')

  const consume = async () => {
    const data = []
    let ema
    for await (const p of source) {
      const timestamp = +p?.timestamp, value = +p?.value
      if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue
      ema = ema === undefined ? value : alpha * value + (1 - alpha) * ema
      data.push({ timestamp, value, ema }) > maxPoints && data.shift()
    }
    return data
  }

  const [{ scaleLinear, line }, data] = await Promise.all([import(D3_URL), consume()])
  const x = scaleLinear([data[0]?.timestamp ?? 0, data.at(-1)?.timestamp ?? 1], [0, width])
  const y = scaleLinear(yDomain, [height, 0])

  return { data, path: line(d => x(d.timestamp), d => y(d.ema))(data) ?? '' }
}
export default createStreamVisualizer;
// Generation time: 35.288s
// Result: PASS