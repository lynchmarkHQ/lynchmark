const CDN = 'https://esm.sh/'
const DEPS = ['js-yaml@4.1.0', 'mathjs@13.2.0', 'ndarray@1.0.19', 'ndarray-fft@1.0.3', 'dompurify@3.1.7']
let deps

const loadDeps = () =>
  (deps ??= Promise.all(DEPS.map(d => import(CDN + d))).catch(e => {
    deps = null
    throw e
  }))

const row = (tag, cells) => `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`

async function analyzeSignal(yaml) {
  const [
    { load },
    { sin, sqrt, round, pi },
    { default: ndarray },
    { default: fft },
    { default: purify }
  ] = await loadDeps()

  const { sampleRate: fs, duration: d, components = [] } = load(yaml) ?? {}
  const N = Math.round(fs * d)
  if (!(fs > 0 && d > 0 && Number.isSafeInteger(N) && N > 0))
    throw new RangeError('sampleRate and duration must yield a positive sample count')
  if (!Array.isArray(components)) throw new TypeError('components must be an array')

  const comps = components.map((c, i) => {
    const f = c?.frequency, a = c?.amplitude
    if (!Number.isFinite(f) || !Number.isFinite(a))
      throw new TypeError(`Invalid component at index ${i}`)
    return [f, a]
  })

  const real = ndarray(Float64Array.from({ length: N }, (_, i) =>
    comps.reduce((s, [f, a]) => s + a * sin(2 * pi * f * (i / fs)), 0)
  ))
  const imag = ndarray(new Float64Array(N))
  fft(1, real, imag)

  const h = N / 2
  const peaks = Array.from({ length: Math.floor(h) + 1 }, (_, k) => ({
    k,
    m: sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / h
  }))
    .filter(({ m }) => m > 0.1)
    .sort((a, b) => b.m - a.m)
    .map(({ k, m }) => ({ frequencyHz: round(k * fs / N), magnitude: round(m, 2) }))

  const html = purify.sanitize(
    `<table>${row('th', ['Frequency (Hz)', 'Magnitude'])}${peaks
      .map(p => row('td', [p.frequencyHz, p.magnitude]))
      .join('')}</table>`
  )

  return { peaks, html, signalLength: N }
}
export default analyzeSignal;
// Generation time: 49.287s
// Result: PASS