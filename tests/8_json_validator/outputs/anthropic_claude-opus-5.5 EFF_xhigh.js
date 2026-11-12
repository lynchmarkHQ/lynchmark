const validateJSON = (() => {
  const AJV = 'https://esm.sh/ajv@8.17.1'
  const FORMATS = 'https://esm.sh/ajv-formats@3.0.1?deps=ajv@8.17.1'
  const DRAFTS = [['2020-12', '/dist/2020'], ['2019-09', '/dist/2019']]
  const EXTRA = {
    __proto__: null,
    additionalProperties: p => p.additionalProperty,
    unevaluatedProperties: p => p.unevaluatedProperty,
    enum: p => p.allowedValues?.map(v => JSON.stringify(v)).join(', '),
    const: p => JSON.stringify(p.allowedValue)
  }
  const modules = new Map()
  const validators = new WeakMap()

  const memo = (cache, key, fn) => {
    cache.has(key) || cache.set(key, fn().catch(e => {
      cache.delete(key)
      throw e
    }))
    return cache.get(key)
  }

  const load = url => memo(modules, url, () => import(url).then(m => m.default?.default ?? m.default ?? m))

  const fetchSchema = async uri => {
    const r = await fetch(uri)
    if (!r.ok) throw new Error(`Unable to load referenced schema ${uri} (HTTP ${r.status})`)
    return r.json()
  }

  const build = async schema => {
    const draft = DRAFTS.find(([d]) => String(schema?.$schema ?? '').includes(d))?.[1] ?? ''
    const [Ajv, addFormats] = await Promise.all([load(AJV + draft), load(FORMATS)])
    const ajv = new Ajv({ allErrors: true, strict: false, loadSchema: fetchSchema })
    addFormats(ajv)
    return ajv.compileAsync(schema)
  }

  const compile = schema =>
    typeof schema === 'boolean' ? build(schema) : memo(validators, schema, () => build(schema))

  const describe = ({ instancePath, message, keyword, params }) => {
    const extra = EXTRA[keyword]?.(params)
    return `${instancePath || '(root)'}: ${message}${extra ? ` (${extra})` : ''}`
  }

  return async function validateJSON(data, schema) {
    if (typeof schema !== 'boolean' && (!schema || typeof schema !== 'object' || Array.isArray(schema)))
      return { valid: false, errors: ['Schema must be a JSON Schema object or boolean'] }
    try {
      const validate = await compile(schema)
      return validate(data)
        ? { valid: true, errors: [] }
        : { valid: false, errors: [...new Set((validate.errors ?? []).map(describe))] }
    } catch (e) {
      return { valid: false, errors: [`Schema validation could not run: ${e?.message ?? e}`] }
    }
  }
})()
export default validateJSON;
// Generation time: 122.649s
// Result: PASS