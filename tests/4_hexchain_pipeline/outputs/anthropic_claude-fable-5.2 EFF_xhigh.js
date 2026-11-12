async function hexchain(toml) {
  const libs = ['smol-toml@1', 'seedrandom@3', 'simple-statistics@7', 'ajv@8', 'text-table@0.2', 'dompurify@3'];
  const [
    { parse },
    { default: seedrandom },
    { mean, standardDeviation, median },
    { default: Ajv },
    { default: textTable },
    { default: DOMPurify }
  ] = await Promise.all(libs.map(lib => import(`https://esm.sh/${lib}`)));

  const schema = {
    type: 'object',
    required: ['seed', 'count', 'label'],
    properties: {
      seed: { type: 'string' },
      count: { type: 'integer', minimum: 1, maximum: 10000 },
      label: { type: 'string', minLength: 1 }
    }
  };
  const config = parse(toml);
  const ajv = new Ajv();

  if (!ajv.validate(schema, config)) return { valid: false, errors: ajv.errorsText() };

  const { seed, count, label } = config;
  const rng = new seedrandom(seed);
  const nums = Array.from({ length: count }, () => rng());
  const round = n => Math.round(n * 1e6) / 1e6;
  const stats = {
    mean: round(mean(nums)),
    stddev: round(standardDeviation(nums)),
    median: round(median(nums))
  };
  const rows = [['Stat', 'Value'], ...Object.entries(stats).map(([k, v]) => [k, String(v)])];
  const table = DOMPurify.sanitize(`<pre class="stats">${textTable(rows)}</pre>`);

  return { valid: true, label, stats, table, count };
}
export default hexchain;
// Generation time: 57.475s
// Result: PASS