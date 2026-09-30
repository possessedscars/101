const crypto = require('crypto');
const COOKIE = '101_admin_session';
const MAX_AGE = 60 * 60 * 8;
function secret(){if(!process.env.ADMIN_SESSION_SECRET)throw new Error('ADMIN_SESSION_SECRET não configurado.');return process.env.ADMIN_SESSION_SECRET}
function sign(value){return crypto.createHmac('sha256',secret()).update(value).digest('base64url')}
function createSession(email){const payload=Buffer.from(JSON.stringify({email,exp:Math.floor(Date.now()/1000)+MAX_AGE})).toString('base64url');return `${payload}.${sign(payload)}`}
function readSession(req){const raw=req.headers.cookie||'';const item=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));if(!item)return null;const token=decodeURIComponent(item.slice(COOKIE.length+1));const [payload,sig]=token.split('.');if(!payload||!sig||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(sign(payload))))return null;try{const data=JSON.parse(Buffer.from(payload,'base64url').toString());if(!data.exp||data.exp<Math.floor(Date.now()/1000))return null;return data}catch{return null}}
function setSession(res,email){res.setHeader('Set-Cookie',`${COOKIE}=${encodeURIComponent(createSession(email))}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`)}
function clearSession(res){res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`)}
function send(res,status,data){res.status(status).setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data))}
module.exports={readSession,setSession,clearSession,send};
