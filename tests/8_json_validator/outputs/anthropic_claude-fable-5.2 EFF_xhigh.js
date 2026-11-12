async function validateJSON(data, schema) {
  const cdn = 'https://esm.sh/';
  const ajv = 'ajv@8.17.1';
  const [, year] = /draft\/(2019|2020)-/.exec(schema?.$schema) ?? [];
  const load = async path => (await import(cdn + path)).default;

  try {
    const [Ajv, addFormats] = await Promise.all([
      load(ajv + (year ? `/dist/${year}` : '')),
      load(`ajv-formats@3.0.1?deps=${ajv}`)
    ]);
    const validate = addFormats(new Ajv({ allErrors: true, strict: false })).compile(schema);
    const valid = validate(data);
    const errors = valid
      ? []
      : validate.errors.map(({ instancePath, message }) => `${instancePath} ${message}`.trim());

    return { valid, errors };
  } catch (e) {
    return { valid: false, errors: [e?.message ?? String(e)] };
  }
}
export default validateJSON;
// Generation time: 96.549s
// Result: PASS