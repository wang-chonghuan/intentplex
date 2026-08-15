/// <reference types="vite/client" />
import {HeadContent, Outlet, Scripts, createRootRoute} from '@tanstack/react-router';
import type {ReactNode} from 'react';

import {SiteProviders} from '~/components/SiteProviders';
import {SiteShell} from '~/components/SiteShell';
import {StyleXDevStyles} from '~/components/StyleXDevStyles';
import {HTML_LANG, DEFAULT_LOCALE} from '~/i18n/locale';
import appCss from '~/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {title: 'Yong Wang — intentplex'},
      {
        name: 'description',
        content:
          'Personal site of Yong Wang, CTO at an AI fintech startup in Dublin. Essays, posts, side projects and where to find them, in English and Chinese.',
      },
    ],
    links: [
      // The stone theme names Figtree, Montserrat and JetBrains Mono but does
      // not bundle them; without these it falls back to system fonts.
      {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
      {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap',
      },
      {rel: 'stylesheet', href: appCss},
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}

function RootDocument({children}: {children: ReactNode}) {
  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]}>
      <head>
        <HeadContent />
        <StyleXDevStyles />
      </head>
      <body>
        <SiteProviders>{children}</SiteProviders>
        <Scripts />
      </body>
    </html>
  );
}
