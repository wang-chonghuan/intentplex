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

function isSecure(url: URL): boolean {
  return url.protocol === 'https:';
}

function redirect(to: string, cookie?: string): Response {
  const headers = new Headers({location: to});
  if (cookie) headers.set('set-cookie', cookie);
  return new Response(null, {status: 302, headers});
}

export async function handleAuthRoute(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

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
