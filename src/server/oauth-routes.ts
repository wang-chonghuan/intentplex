import '@tanstack/react-start/server-only';

import {
  clearedCookie,
  isSignedIn,
  issueSession,
  issueState,
  isValidState,
  oauth,
  sessionCookie,
} from '~/server/auth';

/**
 * The three URLs the GitHub round trip needs, answered before routing.
 *
 * They are raw HTTP, not pages: two redirects and a cookie. Putting them in the
 * request middleware rather than in a route keeps the whole sign-in flow in one
 * file, next to the thing that decides whether a request is allowed through.
 */

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';
const GITHUB_USER = 'https://api.github.com/user';

/**
 * The URL a *browser* used, which is not the one the container received.
 *
 * Azure Container Apps terminates TLS at the ingress and forwards plain HTTP,
 * so `new URL(request.url)` says `http://` and the wrong host. Sending that to
 * GitHub produced `redirect_uri=http://intentplex.com/auth/callback` and the
 * whole sign-in was rejected — and the same mistake made `isSecure` false, so
 * the session cookie shipped without `Secure`. One derivation, used for both.
 *
 * Falls back to the request's own URL when the forwarded headers are absent,
 * which is what local http development needs.
 */
function publicUrl(request: Request): URL {
  const url = new URL(request.url);
  // A proxy chain appends rather than replaces; the first entry is the client.
  const first = (value: string | null) => value?.split(',')[0]?.trim() || undefined;
  const proto = first(request.headers.get('x-forwarded-proto'));
  const host = first(request.headers.get('x-forwarded-host')) ?? first(request.headers.get('host'));
  if (proto) url.protocol = `${proto}:`;
  if (host) {
    // Assigning `host` without a port leaves the old one in place, which turned
    // intentplex.com into intentplex.com:3000. Clear it explicitly.
    url.host = host;
    if (!host.includes(':')) url.port = '';
  }
  return url;
}

function isSecure(url: URL): boolean {
  return url.protocol === 'https:';
}

function redirect(to: string, cookie?: string): Response {
  const headers = new Headers({location: to});
  if (cookie) headers.set('set-cookie', cookie);
  return new Response(null, {status: 302, headers});
}

export async function handleAuthRoute(request: Request): Promise<Response | null> {
  const url = publicUrl(request);

  if (url.pathname === '/auth/signin') {
    const authorize = new URL(GITHUB_AUTHORIZE);
    authorize.searchParams.set('client_id', oauth.clientId());
    authorize.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
    // No scopes. The default grant already reveals the numeric user id, which
    // is the only fact this site asks GitHub for.
    authorize.searchParams.set('scope', '');
    authorize.searchParams.set('state', issueState());
    return redirect(authorize.toString());
  }

  if (url.pathname === '/auth/signout') {
    return redirect('/', clearedCookie(isSecure(url)));
  }

  if (url.pathname === '/auth/callback') {
    const code = url.searchParams.get('code');
    if (!code || !isValidState(url.searchParams.get('state'))) {
      return redirect('/admin/denied');
    }

    const tokenResponse = await fetch(GITHUB_TOKEN, {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify({
        client_id: oauth.clientId(),
        client_secret: oauth.clientSecret(),
        code,
        redirect_uri: `${url.origin}/auth/callback`,
      }),
    });
    const token = (await tokenResponse.json()) as {access_token?: string};
    if (!token.access_token) return redirect('/admin/denied');

    const userResponse = await fetch(GITHUB_USER, {
      headers: {
        authorization: `Bearer ${token.access_token}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'intentplex',
      },
    });
    const user = (await userResponse.json()) as {id?: number};

    // The numeric id, not the login: a login can be renamed and then someone
    // else can claim the old one.
    if (String(user.id) !== oauth.adminUserId()) return redirect('/admin/denied');

    return redirect('/admin', sessionCookie(issueSession(), isSecure(url)));
  }

  // Everything under /admin needs the cookie. The one exception is the page that
  // explains why you were turned away, which has to be reachable without it.
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/denied') {
    if (!isSignedIn(request)) return redirect('/auth/signin');
  }

  return null;
}
