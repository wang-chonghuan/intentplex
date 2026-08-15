import {Link as RouterLink} from '@tanstack/react-router';
import type {AnchorHTMLAttributes, Ref} from 'react';

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>;
};

function isInternal(href: string | undefined): href is string {
  return href != null && href.startsWith('/');
}

/**
 * Paths whose gate is a **request** middleware (`src/start.ts`).
 *
 * That middleware only runs on a document request. A client-side navigation
 * never makes one, so following such a link in the SPA sails straight past the
 * sign-in redirect and lands on a route whose loader then throws — an error
 * boundary instead of GitHub. These have to be entered with a real page load.
 *
 * The rule lives here rather than at one call site because this is the single
 * link adapter: a second place that knows about it is the thing `arch.md`
 * forbids.
 */
const NEEDS_DOCUMENT_REQUEST = /^\/(admin|auth)(\/|$)/;

/**
 * The single link element every Astryx component renders, installed once via
 * LinkProvider. Astryx hands components an `href`; TanStack Router wants `to`,
 * so this adapts one to the other and keeps in-app navigation client-side.
 * Anything not starting with "/" stays a plain anchor.
 */
export function AppLink({href, ref, ...rest}: AppLinkProps) {
  if (isInternal(href)) {
    return (
      <RouterLink
        {...rest}
        ref={ref}
        to={href}
        reloadDocument={NEEDS_DOCUMENT_REQUEST.test(href)}
      />
    );
  }
  return <a {...rest} ref={ref} href={href} />;
}
