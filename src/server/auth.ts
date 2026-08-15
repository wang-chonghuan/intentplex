import '@tanstack/react-start/server-only';

import crypto from 'node:crypto';

/**
 * Sign-in for exactly one person.
 *
 * There is no user table and no password. GitHub says who you are, and a single
 * environment variable says whether that is the one account allowed in. A site
 * with one author does not need an account system — it needs a door that only
 * opens for one key, and every part of an account system that is not that door
 * is a thing that can be got wrong.
 *
 * The session is a signed cookie rather than a row: nothing about it needs to
 * survive a deploy, and revoking it is a matter of rotating `SESSION_SECRET`.
 */

const COOKIE = 'intentplex.session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — the admin cannot sign in without it.`);
  return value;
}

export const oauth = {
  clientId: () => required('GITHUB_CLIENT_ID'),
  clientSecret: () => required('GITHUB_CLIENT_SECRET'),
  /** The numeric GitHub user id — stable across username changes, unlike the login. */
  adminUserId: () => required('ADMIN_GITHUB_USER_ID'),
};

const secret = () => required('SESSION_SECRET');

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

/**
 * `<expiry>.<signature>`.
 *
 * The payload is only an expiry because there is only ever one subject: holding a
 * valid cookie *is* being the admin. Adding the user id would invite reading it
 * as identity, and then someone would want a second one.
 */
export function issueSession(): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  // Length check first: timingSafeEqual throws on a length mismatch, and an
  // attacker controls the length.
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function sessionCookie(token: string, secure: boolean): string {
  return [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    `Max-Age=${MAX_AGE_SECONDS}`,
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearedCookie(secure: boolean): string {
  return sessionCookie('', secure).replace(`Max-Age=${MAX_AGE_SECONDS}`, 'Max-Age=0');
}

export function readSessionCookie(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE) return rest.join('=');
  }
  return undefined;
}

export function isSignedIn(request: Request): boolean {
  return isValidSession(readSessionCookie(request.headers.get('cookie')));
}

/** CSRF/replay guard for the OAuth round trip, signed with the same secret. */
export function issueState(): string {
  const nonce = crypto.randomBytes(16).toString('base64url');
  return `${nonce}.${sign(nonce)}`;
}

export function isValidState(state: string | null): boolean {
  if (!state) return false;
  const [nonce, signature] = state.split('.');
  if (!nonce || !signature) return false;
  const expected = sign(nonce);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
