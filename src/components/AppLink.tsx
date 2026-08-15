import {Link as RouterLink} from '@tanstack/react-router';
import type {AnchorHTMLAttributes, Ref} from 'react';

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>;
};

function isInternal(href: string | undefined): href is string {
  return href != null && href.startsWith('/');
}

/**
 * The single link element every Astryx component renders, installed once via
 * LinkProvider. Astryx hands components an `href`; TanStack Router wants `to`,
 * so this adapts one to the other and keeps in-app navigation client-side.
 * Anything not starting with "/" stays a plain anchor.
 */
export function AppLink({href, ref, ...rest}: AppLinkProps) {
  if (isInternal(href)) {
    return <RouterLink {...rest} ref={ref} to={href} />;
  }
  return <a {...rest} ref={ref} href={href} />;
}
