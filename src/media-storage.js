import { ensureSchema, hasDatabase } from './db.js';

const CONFIG_KEY = 'media_storage_v1';
const encoder = new TextEncoder();
export const MEDIA_PATH = /^\/media\/([a-f0-9-]{36}\.(?:jpg|png|webp|gif|mp4|webm))$/;
const TYPES = {
  'image/jpeg': { extension:'jpg', kind:'image', max:8 * 1024 * 1024 },
  'image/png': { extension:'png', kind:'image', max:8 * 1024 * 1024 },
  'image/webp': { extension:'webp', kind:'image', max:8 * 1024 * 1024 },
  'image/gif': { extension:'gif', kind:'image', max:8 * 1024 * 1024 },
  'video/mp4': { extension:'mp4', kind:'video', max:50 * 1024 * 1024 },
  'video/webm': { extension:'webm', kind:'video', max:50 * 1024 * 1024 },
};
export class MediaInputError extends Error {
  constructor(message, status=400, code) { super(message); this.status=status; this.code=code; }
}

function storageNetworkError(error, timedOut=false) {
  const detail = String(error?.cause?.code || '')+' '+String(error?.message || '');
  const [code,message] = timedOut || /timeout|timed out|ETIMEDOUT/i.test(detail)
    ? ['STORAGE_TIMEOUT','زمان پاسخ‌گویی فضای ابری تمام شد؛ ارتباط Cloudflare با آروان را بررسی کنید.']
    : /ENOTFOUND|EAI_AGAIN|DNS|name resolution/i.test(detail)
    ? ['STORAGE_DNS','نشانی Endpoint از سرور سایت قابل پیدا کردن نیست؛ نشانی فعال همان منطقه را از پنل آروان کپی کنید.']
    : /TLS|SSL|certificate|CERT_/i.test(detail)
    ? ['STORAGE_TLS','ارتباط امن سرور سایت با Endpoint آروان برقرار نشد.']
    : /ECONNRESET|connection (?:lost|reset|closed)|socket hang up/i.test(detail)
    ? ['STORAGE_CONNECTION_RESET','ارتباط سرور سایت با آروان هنگام ارسال درخواست قطع شد.']
    : ['STORAGE_NETWORK','درخواست سرور سایت به آروان نرسید؛ دسترسی شبکه یا Endpoint را بررسی کنید.'];
  return new MediaInputError(message+' ('+code+')',502,code);
}

async function storageResponseError(response, operation) {
  let body = '';
  const reader = response.body?.getReader();
  if (reader) {
    const decoder = new TextDecoder();
    let remaining = 8192;
    try {
      while (remaining > 0) {
        const chunk = await reader.read();
        if (chunk.done) break;
        const bytes = chunk.value.subarray(0,remaining);
        remaining -= bytes.length;
        body += decoder.decode(bytes,{stream:true});
      }
      body += decoder.decode();
    } catch {} finally { await reader.cancel().catch(()=>{}); }
  }
  const serviceCode = body.match(/<Code>\s*([A-Za-z0-9]{1,64})\s*<\/Code>/)?.[1];
  let code, message;
  if (response.status >= 300 && response.status < 400 || ['PermanentRedirect','TemporaryRedirect','IncorrectEndpoint','AuthorizationHeaderMalformed','InvalidRegion'].includes(serviceCode)) {
    code='STORAGE_ENDPOINT_REGION';
    message='آروان نشانی یا منطقه امضای درخواست را نپذیرفت؛ Endpoint و Region فعال همان منطقه را بررسی کنید.';
  } else if (serviceCode === 'InvalidAccessKeyId') {
    code='STORAGE_ACCESS_KEY';
    message='آروان کلید دسترسی را نمی‌شناسد؛ Access Key کاربر موقت انتخاب‌شده را وارد کنید.';
  } else if (serviceCode === 'SignatureDoesNotMatch') {
    code='STORAGE_SIGNATURE';
    message='امضای درخواست با آروان همخوانی ندارد؛ دو کلید متعلق به همان کاربر و Region را بررسی کنید.';
  } else if (['ExpiredToken','InvalidToken','TokenRefreshRequired'].includes(serviceCode)) {
    code='STORAGE_EXPIRED_KEY';
    message='اعتبار کلید موقت تمام شده یا پذیرفته نشد؛ اعتبار همان کاربر موقت را بررسی کنید.';
  } else if (serviceCode === 'RequestTimeTooSkewed') {
    code='STORAGE_CLOCK';
    message='زمان سرور سایت و آروان همخوانی ندارد.';
  } else if (serviceCode === 'NoSuchBucket' || response.status === 404) {
    code='STORAGE_BUCKET';
    message='صندوقچه در Endpoint انتخاب‌شده پیدا نشد؛ نام صندوقچه و منطقه را بررسی کنید.';
  } else if (serviceCode === 'AccessDenied' || response.status === 403) {
    code='STORAGE_PERMISSION';
    message='آروان دسترسی درخواست '+operation+' را رد کرد؛ کلیدهای کاربر موقت و پالیسی همین صندوقچه را بررسی کنید.';
  } else if (response.status >= 500) {
    code='STORAGE_SERVICE';
    message='سرویس آروان هنگام بررسی اتصال پاسخ خطا داد؛ دوباره تلاش کنید.';
  } else {
    code='STORAGE_RESPONSE';
    message='پاسخ بررسی اتصال فضای ابری پذیرفته نشد.';
  }
  return new MediaInputError(message+' ('+code+'؛ HTTP '+response.status+')',response.status>=500 ? 502 : 400,code);
}

export function mediaUrl(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (MEDIA_PATH.test(text)) return text;
  try {
    const url = new URL(text);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

function configInput(input = {}) {
  let url;
  try { url = new URL(String(input.endpoint || '').trim()); } catch { throw new MediaInputError('نشانی فضای ابری را از پنل ابرآروان وارد کنید.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || !/^\/[\s]*$/.test(url.pathname) || !/^[a-z0-9.-]+\.arvanstorage\.(?:ir|com)$/.test(url.hostname)) {
    throw new MediaInputError('فقط نشانی HTTPS فضای ابری ابرآروان پذیرفته می‌شود.');
  }
  const bucket = String(input.bucket || '').trim();
  if (!/^negahjavan[a-z0-9-]{0,52}[a-z0-9]$/.test(bucket) && bucket !== 'negahjavan') throw new MediaInputError('نام فضای مستقل نگاه جوان باید با negahjavan شروع شود؛ مانند negahjavan-media.');
  const region = String(input.region || '').trim();
  if (!/^[a-z0-9-]{1,64}$/.test(region)) throw new MediaInputError('منطقه فضای ابری را مطابق پنل ابرآروان وارد کنید.');
  const accessKey = String(input.access_key || '').trim(), secretKey = String(input.secret_key || '').trim();
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(accessKey) || !secretKey || secretKey.length > 256 || /[\r\n\x00-\x1f]/.test(secretKey)) throw new MediaInputError('کلید دسترسی و کلید محرمانه فضای ابری لازم است.');
  return { endpoint:url.origin, bucket, region, accessKey, secretKey };
}

const hex = bytes => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2,'0')).join('');
const base64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = text => Uint8Array.from(atob(text), letter => letter.charCodeAt(0));
async function digest(text) { return crypto.subtle.digest('SHA-256', encoder.encode(text)); }
async function hmac(key, text) {
  const imported = await crypto.subtle.importKey('raw', typeof key === 'string' ? encoder.encode(key) : key, {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return crypto.subtle.sign('HMAC', imported, encoder.encode(text));
}
async function encryptionKey(env) {
  if (!env.AUTH_SECRET) throw new MediaInputError('ورود امن تحریریه هنوز آماده نیست.',503);
  return crypto.subtle.importKey('raw', await digest(env.AUTH_SECRET), 'AES-GCM', false, ['encrypt','decrypt']);
}
async function readConfig(env) {
  if (!(await ensureSchema(env))) return null;
  const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind(CONFIG_KEY).first();
  if (!row) return null;
  try {
    const sealed = JSON.parse(row.value);
    const clear = await crypto.subtle.decrypt({name:'AES-GCM', iv:fromBase64(sealed.iv), additionalData:encoder.encode(CONFIG_KEY)}, await encryptionKey(env), fromBase64(sealed.ciphertext));
    const stored = JSON.parse(new TextDecoder().decode(clear));
    return configInput({endpoint:stored.endpoint,bucket:stored.bucket,region:stored.region,access_key:stored.accessKey,secret_key:stored.secretKey});
  } catch { throw new MediaInputError('اتصال فضای ابری باید دوباره تنظیم شود.',503); }
}
function connectionStatus(config) {
  return config ? {configured:true, provider:'arvan',endpoint:config.endpoint,bucket:config.bucket,region:config.region} : {configured:false,provider:'arvan'};
}
export async function mediaSettings(env) {
  try { return connectionStatus(await readConfig(env)); }
  catch { return {configured:false,provider:'arvan',needsReconnect:true}; }
}

// SigV4 uses the official S3 canonical request, with UNSIGNED-PAYLOAD over HTTPS.
export async function signedStorageRequest(config, method, objectKey='', extraHeaders={}, now=new Date(), query={}) {
  const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%'+c.charCodeAt(0).toString(16).toUpperCase());
  const uri = '/' + [config.bucket,...objectKey.split('/').filter(Boolean)].map(part => encodeURIComponent(part).replace(/[!'()*]/g, c => '%'+c.charCodeAt(0).toString(16).toUpperCase())).join('/');
  const canonicalQuery = Object.entries(query).map(([name,value])=>[encode(name),encode(String(value))]).sort(([a,av],[b,bv])=>a<b ? -1 : a>b ? 1 : av<bv ? -1 : av>bv ? 1 : 0).map(([name,value])=>name+'='+value).join('&');
  const url = config.endpoint + uri + (canonicalQuery ? '?'+canonicalQuery : '');
  const date = now.toISOString().replace(/[:-]|\.\d{3}/g,'');
  const shortDate = date.slice(0,8), scope = `${shortDate}/${config.region}/s3/aws4_request`;
  const headers = new Headers(extraHeaders);
  headers.set('x-amz-date',date);
  headers.set('x-amz-content-sha256','UNSIGNED-PAYLOAD');
  const canonicalHeaders = new Map([...headers].filter(([name])=>name !== 'content-length').map(([name,value])=>[name,value.trim().replace(/\s+/g,' ')]));
  canonicalHeaders.set('host',new URL(config.endpoint).host);
  const names = [...canonicalHeaders.keys()].sort();
  const canonical = [method,uri,canonicalQuery,names.map(name=>`${name}:${canonicalHeaders.get(name)}\n`).join(''),names.join(';'),'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256',date,scope,hex(await digest(canonical))].join('\n');
  const dateKey = await hmac('AWS4'+config.secretKey,shortDate);
  const regionKey = await hmac(dateKey,config.region), serviceKey = await hmac(regionKey,'s3');
  const signature = hex(await hmac(await hmac(serviceKey,'aws4_request'),toSign));
  headers.set('Authorization',`AWS4-HMAC-SHA256 Credential=${config.accessKey}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`);
  return {url,headers};
}

async function storageFetch(config, method, key='', headers={}, body, query={}) {
  const signed = await signedStorageRequest(config,method,key,headers,new Date(),query);
  const controller = ['GET','HEAD'].includes(method) ? new AbortController() : null;
  const timer = controller ? setTimeout(()=>controller.abort(),20000) : null;
  try {
    // Inspect redirects without forwarding storage credentials to another host.
    return await fetch(signed.url,{method,headers:signed.headers,body,redirect:'manual',...(controller ? {signal:controller.signal} : {}),...(body ? {duplex:'half'} : {})});
  } catch (error) { throw storageNetworkError(error,controller?.signal.aborted); }
  finally { if (timer !== null) clearTimeout(timer); }
}

export async function saveMediaSettings(env, input) {
  if (!hasDatabase(env)) throw new MediaInputError('دیتابیس در دسترس نیست.',503);
  await ensureSchema(env);
  const config = configInput(input);
  const existingFiles = await env.DB.prepare("SELECT value FROM site_settings WHERE key LIKE 'media_file:%' LIMIT 1").first();
  if (existingFiles) {
    let previous;
    try { previous=await readConfig(env); }
    catch {
      const row=await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind(CONFIG_KEY).first();
      try { previous=JSON.parse(row?.value||'{}'); } catch { previous=null; }
    }
    if (!previous || previous.endpoint !== config.endpoint || previous.bucket !== config.bucket) throw new MediaInputError('برای حفظ فایل‌های قبلی، نشانی و نام فضای ابری را تغییر ندهید. کلیدها قابل به‌روزرسانی هستند.',409);
  }
  // ListBucket provides the S3 error code that a failed HEAD request omits.
  // No file contents or object names are requested during this check.
  const check = await storageFetch(config,'GET','',{},undefined,{'list-type':'2','max-keys':'0'});
  if (!check.ok) throw await storageResponseError(check,'ListBucket');
  await check.body?.cancel().catch(()=>{});
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(CONFIG_KEY)},await encryptionKey(env),encoder.encode(JSON.stringify(config)));
  const sealed = JSON.stringify({version:1,endpoint:config.endpoint,bucket:config.bucket,region:config.region,iv:base64(iv),ciphertext:base64(ciphertext)});
  await env.DB.prepare('INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').bind(CONFIG_KEY,sealed).run();
  return connectionStatus(config);
}

export function validMediaSignature(mime, bytes) {
  const chars = (start,end) => String.fromCharCode(...bytes.slice(start,end));
  return mime === 'image/jpeg' ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255
    : mime === 'image/png' ? [137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)
    : mime === 'image/gif' ? ['GIF87a','GIF89a'].includes(chars(0,6))
    : mime === 'image/webp' ? chars(0,4)==='RIFF' && chars(8,12)==='WEBP'
    : mime === 'video/mp4' ? bytes.length >= 12 && chars(4,8)==='ftyp'
    : mime === 'video/webm' ? [26,69,223,163].every((value,index)=>bytes[index]===value)
    : false;
}

async function validatedStream(request, mime, size) {
  if (!request.body) throw new MediaInputError('فایلی انتخاب نشده است.');
  const reader = request.body.getReader(), prefixChunks = [];
  let count = 0;
  while (count < Math.min(size,16)) {
    const chunk = await reader.read();
    if (chunk.done) break;
    count += chunk.value.byteLength;
    prefixChunks.push(chunk.value);
    if (count > size) { await reader.cancel(); throw new MediaInputError('حجم فایل با درخواست همخوانی ندارد.'); }
  }
  const prefix = new Uint8Array(Math.min(count,16));
  let offset = 0;
  for (const chunk of prefixChunks) { const part=chunk.subarray(0,prefix.length-offset);prefix.set(part,offset);offset+=part.length;if(offset===prefix.length)break; }
  if (!validMediaSignature(mime,prefix)) { await reader.cancel(); throw new MediaInputError('محتوای فایل با نوع عکس یا فیلم انتخاب‌شده همخوانی ندارد.'); }
  const stream = new ReadableStream({
    async pull(controller) {
      if (prefixChunks.length) { controller.enqueue(prefixChunks.shift()); return; }
      try {
        const chunk = await reader.read();
        if (chunk.done) { if(count!==size) throw new Error('Invalid file length');controller.close();return; }
        count += chunk.value.byteLength;
        if(count>size) throw new Error('Invalid file length');
        controller.enqueue(chunk.value);
      } catch(error) { await reader.cancel().catch(()=>{});controller.error(error); }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  return typeof FixedLengthStream === 'function' ? stream.pipeThrough(new FixedLengthStream(size)) : stream;
}

export async function uploadMedia(request, env, {generated = false} = {}) {
  const mime = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase(), type = TYPES[mime];
  if (!type) throw new MediaInputError('عکس JPG، PNG، WebP یا GIF و فیلم MP4 یا WebM انتخاب کنید.',415);
  const length = request.headers.get('Content-Length'), reported=request.headers.get('X-Upload-Size');
  const size = Number(length || reported);
  if (!Number.isSafeInteger(size) || size <= 0 || (length && reported && Number(length)!==Number(reported))) throw new MediaInputError('حجم فایل معتبر نیست.');
  if (size > type.max) throw new MediaInputError(type.kind==='image' ? 'حداکثر حجم عکس ۸ مگابایت است.' : 'حداکثر حجم فیلم ۵۰ مگابایت است.',413);
  const config = await readConfig(env);
  if (!config) throw new MediaInputError('ابتدا فضای مستقل ابرآروان را در بخش «اتصال فضای عکس و فیلم» وصل کنید.',503);
  const stream = await validatedStream(request,mime,size);
  const id = crypto.randomUUID()+'.'+type.extension, key='negahjavan/'+type.kind+'/'+id;
  const response = await storageFetch(config,'PUT',key,{'Content-Type':mime,'Content-Length':String(size)},stream);
  if (!response.ok) throw await storageResponseError(response,'PutObject');
  await response.body?.cancel().catch(()=>{});
  let name;
  try { name=decodeURIComponent(request.headers.get('X-File-Name')||''); } catch { name=''; }
  const metadata = {key,kind:type.kind,mime,size,name:String(name||id).replace(/[\x00-\x1f\x7f]/g,'').slice(0,160),...(generated ? {generated_by:'workers-ai'} : {})};
  await env.DB.prepare('INSERT INTO site_settings(key,value) VALUES(?,?)').bind('media_file:'+id,JSON.stringify(metadata)).run();
  return {url:'/media/'+id,kind:type.kind,mime,size,name:metadata.name,generated};
}

export async function storeGeneratedImage(env, bytes, name = 'تصویرسازی خبر.jpg') {
  const request = new Request('https://negahjavan.ir/api/admin/media', {
    method:'POST', body:bytes,
    headers:{'Content-Type':'image/jpeg','X-Upload-Size':String(bytes.byteLength),'X-File-Name':encodeURIComponent(name)},
  });
  return await uploadMedia(request, env, {generated:true});
}

export async function validateArticleMedia(env, input) {
  await ensureSchema(env);
  for (const [field,kind] of [['hero_image','image'],['video_url','video']]) {
    if (!(field in input)) continue;
    const raw=String(input[field] || '').trim(), url=mediaUrl(raw);
    if (raw && !url) throw new MediaInputError('نشانی عکس یا فیلم باید HTTPS یا فایل بارگذاری‌شده تحریریه باشد.');
    const match=url.match(MEDIA_PATH);
    if (kind === 'image') input.image_generated = false;
    if (match) {
      const row=await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('media_file:'+match[1]).first();
      let metadata;
      try { metadata=JSON.parse(row?.value||'{}'); } catch { metadata={}; }
      if(metadata.kind!==kind) throw new MediaInputError('فایل انتخاب‌شده برای این بخش معتبر نیست.');
      if(kind==='video') input.video_type=metadata.mime;
      if(kind==='image') input.image_generated=metadata.generated_by==='workers-ai';
    }
    input[field]=url;
  }
  return input;
}

export async function attachMediaRenditions(env, input = {}) {
  await ensureSchema(env);
  const originalMatch = String(input.original || '').match(MEDIA_PATH);
  if (!originalMatch) throw new MediaInputError('فایل اصلی فیلم معتبر نیست.');
  const key = 'media_file:' + originalMatch[1];
  const row = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind(key).first();
  let original;
  try { original = JSON.parse(row?.value || '{}'); } catch { original = {}; }
  if (original.kind !== 'video' || !TYPES[original.mime] || !original.key?.startsWith('negahjavan/')) throw new MediaInputError('فایل اصلی فیلم پیدا نشد.');
  const variants = {...original.variants};
  let count = 0;
  for (const [format, mime] of [['mp4','video/mp4'], ['webm','video/webm']]) {
    if (!Object.hasOwn(input, format)) continue;
    const match = String(input[format] || '').match(MEDIA_PATH);
    if (!match || match[1] === originalMatch[1]) throw new MediaInputError('نسخهٔ جایگزین فیلم معتبر نیست.');
    const variantRow = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('media_file:' + match[1]).first();
    let variant;
    try { variant = JSON.parse(variantRow?.value || '{}'); } catch { variant = {}; }
    if (variant.kind !== 'video' || variant.mime !== mime || !variant.key?.startsWith('negahjavan/')) throw new MediaInputError('فرمت نسخهٔ جایگزین فیلم معتبر نیست.');
    variants[format] = match[1];
    count++;
  }
  if (!count) throw new MediaInputError('حداقل یک نسخهٔ جایگزین فیلم لازم است.');
  await env.DB.prepare('INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key,JSON.stringify({...original, variants})).run();
  return {url:input.original,formats:Object.keys(variants)};
}

export async function serveMedia(request, env, id, authenticated=false) {
  if (!(await ensureSchema(env))) return new Response('Not found',{status:404});
  const row=await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('media_file:'+id).first();
  let file;
  try { file=JSON.parse(row?.value||'{}'); } catch { file={}; }
  if (!TYPES[file.mime] || !file.key?.startsWith('negahjavan/')) return new Response('Not found',{status:404});
  const path='/media/'+id;
  const published=await env.DB.prepare(`SELECT a.id FROM articles a LEFT JOIN site_settings m ON m.key='article_meta:'||a.id WHERE a.status IN ('published','breaking') AND a.published_at IS NOT NULL AND (a.hero_image=? OR (json_valid(m.value) AND json_extract(m.value,'$.video_url')=?)) LIMIT 1`).bind(path,path).first();
  if (!published && !authenticated) return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  const format = new URL(request.url).searchParams.get('format');
  if (format && !['mp4','webm','original'].includes(format)) return new Response('Invalid format',{status:400,headers:{'Cache-Control':'no-store'}});
  const preferred = format === 'original' ? '' : format || (file.mime === 'video/mp4' ? 'mp4' : '');
  if (preferred && file.variants?.[preferred]) {
    const variantId = file.variants[preferred];
    if (!MEDIA_PATH.test('/media/' + variantId)) return new Response('Not found',{status:404});
    const variantRow = await env.DB.prepare('SELECT value FROM site_settings WHERE key=?').bind('media_file:' + variantId).first();
    let variant;
    try { variant = JSON.parse(variantRow?.value || '{}'); } catch { variant = {}; }
    if (variant.kind !== 'video' || variant.mime !== 'video/' + preferred || !variant.key?.startsWith('negahjavan/')) return new Response('Not found',{status:404});
    file = variant;
  } else if (format && format !== 'original' && file.mime !== 'video/' + format) {
    return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  }
  const config=await readConfig(env);
  if (!config) return new Response('Media unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  const outgoing={}, range=request.headers.get('Range');
  if (range) {
    if (!/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+file.size}});
    outgoing.Range=range;
  }
  const response=await storageFetch(config,request.method,file.key,outgoing);
  if (![200,206,304,416].includes(response.status)) { await response.body?.cancel().catch(()=>{});return new Response('Media unavailable',{status:response.status===404 ? 404 : 502,headers:{'Cache-Control':'no-store'}}); }
  const headers=new Headers({'Content-Type':file.mime,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':published?'public, max-age=60':'private, no-store','Cross-Origin-Resource-Policy':'same-origin'});
  for(const name of ['Content-Length','Content-Range','ETag','Last-Modified']) if(response.headers.has(name))headers.set(name,response.headers.get(name));
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
}

