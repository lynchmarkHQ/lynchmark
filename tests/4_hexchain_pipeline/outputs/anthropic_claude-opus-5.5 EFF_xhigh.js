const CDN = 'https://esm.sh/';
const LIBS = ['smol-toml@1', 'seedrandom@3', 'simple-statistics@7', 'ajv@8', 'text-table@0.2', 'dompurify@3'];
const SCHEMA = {
  type: 'object',
  required: ['seed', 'count', 'label'],
  properties: {
    seed: { type: 'string' },
    count: { type: 'integer', minimum: 1, maximum: 10000 },
    label: { type: 'string', minLength: 1 }
  }
};

const def = m => m.default?.default ?? m.default ?? m;
const round6 = x => +x.toFixed(6);

let ctx;
const init = () =>
  (ctx ??= Promise.all(LIBS.map(l => import(CDN + l)))
    .then(([toml, sr, ss, aj, tt, dp]) => ({
      parse: toml.parse,
      seedrandom: def(sr),
      ss,
      ajv: new (def(aj))(),
      table: def(tt),
      purify: def(dp)
    }))
    .catch(e => {
      ctx = null;
      throw e;
    }));

async function hexchain(tomlString) {
  const { parse, seedrandom, ss, ajv, table, purify } = await init();
  const config = parse(tomlString);
  if (!ajv.validate(SCHEMA, config)) return { valid: false, errors: ajv.errorsText() };
  const rng = new seedrandom(config.seed);
  const nums = Array.from({ length: config.count }, () => rng());
  const stats = {
    mean: round6(ss.mean(nums)),
    stddev: round6(ss.standardDeviation(nums)),
    median: round6(ss.median(nums))
  };
  const ascii = table([['Stat', 'Value'], ...Object.entries(stats).map(([k, v]) => [k, String(v)])]);
  return {
    valid: true,
    label: config.label,
    stats,
    table: purify.sanitize(`<pre class="stats">${ascii}</pre>`),
    count: config.count
  };
}
export default hexchain;
// Generation time: 38.298s
// Result: PASS