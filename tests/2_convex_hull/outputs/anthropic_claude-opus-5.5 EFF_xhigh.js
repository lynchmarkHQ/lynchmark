const LODASH_URL='https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm'
let lodash
const loadLodash=()=>lodash??=import(LODASH_URL).catch(e=>{lodash=null;throw e})
const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x)
const chain=pts=>pts.reduce((h,p)=>{
  while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop()
  h.push(p)
  return h
},[])
const findConvexHull=async points=>{
  if(!Array.isArray(points))throw new TypeError('points must be an array')
  if(points.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)))throw new TypeError('each point must have finite numeric x and y')
  const{sortBy,uniqBy}=await loadLodash()
  const s=sortBy(uniqBy(points,p=>`${p.x},${p.y}`),['x','y'])
  if(s.length<3)return s
  const lo=chain(s),up=chain([...s].reverse())
  return[...lo.slice(0,-1),...up.slice(0,-1)]
}
export default findConvexHull;
// Generation time: 16.164s
// Result: PASS