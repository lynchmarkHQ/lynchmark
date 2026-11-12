async function parseMarkdown(md = '') {
  const [{ parse }, { default: purify }] = await Promise.all(
    ['marked@15', 'dompurify@3'].map(pkg => import(`https://cdn.jsdelivr.net/npm/${pkg}/+esm`))
  )
  return purify.sanitize(parse(md))
}
export default parseMarkdown;
// Generation time: 45.720s
// Result: PASS