const SCRYPT_URL='https://cdn.jsdelivr.net/npm/scrypt-js@3.0.1/+esm';
let scryptPromise;

const loadScrypt=()=>scryptPromise??=import(SCRYPT_URL).then(m=>{
  const f=m.scrypt??m.default?.scrypt;
  if(typeof f!='function')throw Error('scrypt-js: scrypt export not found');
  return f;
}).catch(e=>{
  scryptPromise=null;
  throw e;
});

async function hashPassword(password,salt){
  if(typeof password!='string'||typeof salt!='string')throw TypeError('password and salt must be strings');
  const scrypt=await loadScrypt(),te=new TextEncoder();
  const hash=await scrypt(te.encode(password),te.encode(salt),1024,8,1,32);
  return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
}
export default hashPassword;
// Generation time: 22.655s
// Result: PASS