/** One-off, local OAuth authorization for the independent silviocosta.net backend.
 * No dependencies, no secret logging, no mailbox reads, no email sent here.
 * Usage: node scripts/authorize-gmail.mjs /private/google-client.json /private/gmail.env
 * Both files must be in this project's .migration-private directory.
 */
import http from 'node:http';
import { randomBytes, createHash, createPublicKey, verify } from 'node:crypto';
import { readFile, writeFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const owner = 'silvio@silviocosta.net';
const project = 'sffgaplkqmmnikqhhftx';
const privateRoot = '/Users/silviocosta_m5/Documents/Silvio Projects/cinematic-spark-suite/.migration-private';
const redirect = 'http://127.0.0.1:8789/oauth/google/gmail/callback';
const scopes = ['openid', 'email', 'https://www.googleapis.com/auth/gmail.send'];
const allowedScopes = new Set([...scopes, 'https://www.googleapis.com/auth/userinfo.email']);
const [clientPath, outputPath] = process.argv.slice(2);
if (!clientPath || !outputPath) throw new Error('Pass private client JSON path and private output env path.');
for (const file of [clientPath, outputPath]) {
  const parent = await realpath(path.dirname(path.resolve(file)));
  if (!parent.startsWith(`${await realpath(privateRoot)}${path.sep}`)) throw new Error('Use the project private directory.');
  if ((await stat(parent)).mode & 0o077) throw new Error('Private directory must have mode 0700.');
}
for (const file of [outputPath, `${outputPath}.status.json`]) {
  try { await stat(file); throw new Error('Output already exists. Refusing to overwrite authorization.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
let client;
try { client = JSON.parse(await readFile(clientPath, 'utf8')).web; }
catch { throw new Error('Cannot read the private OAuth client JSON.'); }
if (client?.project_id !== 'silviocosta-net-avisos' || !client?.client_id || !client?.client_secret || !client.redirect_uris?.includes(redirect)) {
  throw new Error('Expected a web OAuth client with the exact local callback URI.');
}
const state = randomBytes(32).toString('base64url');
const nonce = randomBytes(32).toString('base64url');
const verifier = randomBytes(48).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth');
auth.search = new URLSearchParams({
  client_id: client.client_id, redirect_uri: redirect, response_type: 'code',
  scope: scopes.join(' '), state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  access_type: 'offline', prompt: 'consent', include_granted_scopes: 'false',
  login_hint: owner, hd: 'silviocosta.net',
}).toString();

async function verifyIdentity(idToken) {
  if (typeof idToken !== 'string') throw new Error('identity_missing');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('identity_invalid');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url'));
  if (header.alg !== 'RS256' || !header.kid) throw new Error('identity_algorithm_invalid');
  const keysResponse = await fetch('https://www.googleapis.com/oauth2/v3/certs', { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!keysResponse.ok) throw new Error('identity_keys_unavailable');
  const keys = await keysResponse.json();
  const jwk = keys.keys?.find(key => key.kid === header.kid && key.kty === 'RSA');
  if (!jwk || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'))) {
    throw new Error('identity_signature_invalid');
  }
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url'));
  const now = Math.floor(Date.now() / 1000);
  if (!['accounts.google.com','https://accounts.google.com'].includes(claims.iss) ||
      claims.aud !== client.client_id || claims.nonce !== nonce ||
      typeof claims.exp !== 'number' || claims.exp <= now ||
      typeof claims.iat !== 'number' || claims.iat > now + 60 ||
      claims.email?.toLowerCase() !== owner || claims.email_verified !== true ||
      claims.hd !== 'silviocosta.net') throw new Error('identity_account_or_claims_invalid');
}

let used = false;
const reply = (response, status, message) => {
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; frame-ancestors 'none'" });
  response.end(`<!doctype html><html lang="es"><meta charset="utf-8"><title>Gmail · silviocosta.net</title><main style="font:18px system-ui;max-width:720px;margin:70px auto;line-height:1.6"><h1>Gmail · silviocosta.net</h1>${message}</main></html>`);
};
const server = http.createServer(async (request, response) => {
  if (request.headers.host !== '127.0.0.1:8789' || request.method !== 'GET') return reply(response, 400, 'Solicitud no válida.');
  const url = new URL(request.url, 'http://127.0.0.1:8789');
  if (url.pathname === '/') {
    return reply(response, 200, `<p>Autoriza únicamente el envío de avisos desde <strong>${owner}</strong> al nuevo backend de silviocosta.net.</p><p>No se autoriza leer ni borrar correos. Google también confirma tu identidad básica.</p><p><a href="${auth.toString().replace(/&/g, '&amp;')}">Continuar con Google</a></p><p>Backend: ${project}. No se enviará ningún email durante este paso.</p>`);
  }
  if (url.pathname !== '/oauth/google/gmail/callback') return reply(response, 404, 'Ruta no disponible.');
  if (used || url.searchParams.get('state') !== state) return reply(response, 400, 'Autorización no válida o ya utilizada.');
  used = true;
  if (url.searchParams.has('error') || !url.searchParams.get('code')) {
    reply(response, 400, 'La autorización no se ha completado. No se ha guardado ninguna credencial.');
    return;
  }
  try {
    const exchange = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code: url.searchParams.get('code'), client_id: client.client_id,
        client_secret: client.client_secret, redirect_uri: redirect, code_verifier: verifier, grant_type: 'authorization_code' }),
    });
    if (!exchange.ok) throw new Error('token_exchange_failed');
    const tokens = await exchange.json();
    const granted = String(tokens.scope || '').split(/\s+/).filter(Boolean);
    if (!granted.includes(scopes[2]) || granted.some(scope => !allowedScopes.has(scope)) || !tokens.refresh_token) throw new Error('granted_scope_or_refresh_invalid');
    await verifyIdentity(tokens.id_token);
    const env = { GMAIL_CLIENT_ID: client.client_id, GMAIL_CLIENT_SECRET: client.client_secret, GMAIL_REFRESH_TOKEN: tokens.refresh_token };
    if (Object.values(env).some(value => typeof value !== 'string' || /[\r\n]/.test(value))) throw new Error('credential_format_invalid');
    await writeFile(outputPath, Object.entries(env).map(([key,value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600, flag: 'wx' });
    await writeFile(`${outputPath}.status.json`, JSON.stringify({ authorizedAt: new Date().toISOString(), account: owner, project, scopes: granted, state: 'authorized_locally_not_deployed' }, null, 2), { mode: 0o600, flag: 'wx' });
    reply(response, 200, '<p><strong>Autorización recibida y cuenta verificada.</strong></p><p>Falta instalarla en el backend y comprobar un envío. Esto todavía no confirma que los avisos estén operativos.</p><p>Puedes volver a Codex. No copies claves ni códigos en el chat.</p>');
    console.log('Gmail authorization verified and stored privately. No email sent; deployment still pending.');
    server.close();
    clearTimeout(expiry);
  } catch {
    // Do not log provider bodies, callback URLs, authorization codes or tokens.
    reply(response, 400, 'No se ha podido validar la autorización para la cuenta y permisos previstos. No se ha desplegado ninguna credencial. Vuelve a Codex.');
    console.log('Gmail authorization validation failed; no deployment performed.');
  }
});
server.listen(8789, '127.0.0.1', () => console.log('Open http://127.0.0.1:8789 to authorize the owner Gmail account. Waiting up to 15 minutes.'));
const expiry = setTimeout(() => { server.close(); console.log('Authorization window closed.'); }, 15 * 60 * 1000);
server.on('error', () => { clearTimeout(expiry); console.error('Cannot open the local authorization listener.'); process.exitCode = 1; });
