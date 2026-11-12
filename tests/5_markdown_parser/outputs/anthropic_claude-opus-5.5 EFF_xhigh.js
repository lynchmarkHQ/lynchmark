const parseMarkdown = (() => {
  const CDN = 'https://cdn.jsdelivr.net/npm/';
  let libs;

  const load = () =>
    libs ??= Promise.all([
      import(`${CDN}marked@12.0.2/+esm`),
      import(`${CDN}dompurify@3.1.6/+esm`)
    ]).then(
      ([{ Marked }, { default: purify }]) => ({
        md: new Marked({ gfm: true, breaks: false }),
        purify
      }),
      e => {
        libs = null;
        throw e;
      }
    );

  return async src => {
    if (typeof src !== 'string') throw new TypeError('parseMarkdown: expected a string');
    if (!src.trim()) return '';
    const { md, purify } = await load();
    return purify.sanitize(await md.parse(src));
  };
})();
export default parseMarkdown;
// Generation time: 19.602s
// Result: PASS