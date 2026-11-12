async function analyzeSignal(yamlText) {
  const load = lib => import(`https://esm.sh/${lib}`).then(m => m.default ?? m);
  const [yaml, math, ndarray, fft, purify] = await Promise.all(
    ['js-yaml@4', 'mathjs@13', 'ndarray@1', 'ndarray-fft@1', 'dompurify@3'].map(load)
  );

  const { sampleRate, duration, components } = yaml.load(yamlText) ?? {};
  const N = Math.round(sampleRate * duration);
  if (!(Number.isSafeInteger(N) && N > 0 && Array.isArray(components)))
    throw new TypeError('Invalid signal config');

  const signal = Array.from({ length: N }, (_, i) => {
    const t = i / sampleRate;
    return components.reduce(
      (sum, { frequency, amplitude }) => sum + amplitude * math.sin(2 * math.pi * frequency * t),
      0
    );
  });

  const real = ndarray(Float64Array.from(signal));
  const imag = ndarray(new Float64Array(N));
  fft(1, real, imag);

  const half = N / 2;
  const peaks = Array.from({ length: (N >> 1) + 1 }, (_, k) => ({
    frequencyHz: Math.round(k * sampleRate / N),
    magnitude: math.sqrt(real.get(k) ** 2 + imag.get(k) ** 2) / half
  }))
    .filter(({ magnitude }) => magnitude > 0.1)
    .sort((a, b) => b.magnitude - a.magnitude)
    .map(({ frequencyHz, magnitude }) => ({ frequencyHz, magnitude: +magnitude.toFixed(2) }));

  const rows = peaks.map(
    ({ frequencyHz, magnitude }) => `<tr><td>${frequencyHz}</td><td>${magnitude}</td></tr>`
  );
  const html = purify.sanitize(
    `<table><tr><th>Frequency (Hz)</th><th>Magnitude</th></tr>${rows.join('')}</table>`
  );

  return { peaks, html, signalLength: N };
}
export default analyzeSignal;
// Generation time: 100.887s
// Result: PASS