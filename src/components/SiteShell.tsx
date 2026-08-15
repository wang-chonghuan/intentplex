import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {useRouterState} from '@tanstack/react-router';

import {AppearanceSwitch} from '~/components/AppearanceSwitch';
import {LanguageSwitch} from '~/components/LanguageSwitch';
import {adminCopy} from '~/content/admin-copy';
import {site} from '~/content/site';
import {useLocale} from '~/i18n/locale';
import {frame, space} from '~/styles/tokens.stylex';

/**
 * Frame — a single content column under a top nav.
 *
 * The nav bar is deliberately opaque, and `variant` is what makes it so:
 * `"section"` only draws dividers and leaves the sticky header with no
 * background of its own, so page content scrolls straight through it and
 * collides with the nav labels. `"surface"` paints it.
 *
 * Responsive contract:
 *   > 1080px  centred 1080px column, 32px gutters
 *   <= 1080px column fills the viewport, gutters shrink to 16px
 *   <= 768px  AppShell folds the nav items into its own mobile drawer
 */
const NAV_ITEMS = [
  {to: '/', key: 'home'},
  {to: '/posts', key: 'posts'},
  {to: '/articles', key: 'articles'},
  {to: '/works', key: 'works'},
  {to: '/contacts', key: 'contacts'},
] as const;

// Admin sits after the content items and is deliberately visible to everyone.
// Hiding it until signed in would make this page's HTML vary by cookie, which
// is a bad trade for one button — and the door is not a secret anyway: it opens
// for exactly one GitHub account.
const ADMIN_ITEM = {to: '/admin'} as const;

const styles = stylex.create({
  column: {
    marginInline: 'auto',
    maxWidth: frame.pageWidth,
    paddingInline: {
      default: space.s8,
      '@media (max-width: 1080px)': space.s4,
    },
    paddingBlock: space.s8,
    width: '100%',
  },
});

export function SiteShell({children}: {children: ReactNode}) {
  const {t} = useLocale();
  const pathname = useRouterState({select: (state) => state.location.pathname});

  return (
    <AppShell
      height="auto"
      variant="surface"
      contentPadding={0}
      topNav={
        <TopNav
          label={t(site.nav.home)}
          heading={<TopNavHeading heading={site.wordmark} headingHref="/" />}
          startContent={[
            ...NAV_ITEMS.map(({to, key}) => (
              <TopNavItem
                key={to}
                href={to}
                label={t(site.nav[key])}
                isSelected={to === '/' ? pathname === '/' : pathname.startsWith(to)}
              />
            )),
            <TopNavItem
              key={ADMIN_ITEM.to}
              href={ADMIN_ITEM.to}
              label={t(adminCopy.nav)}
              isSelected={pathname.startsWith(ADMIN_ITEM.to)}
            />,
          ]}
          endContent={
            <HStack gap={2} vAlign="center">
              <LanguageSwitch />
              <AppearanceSwitch />
            </HStack>
          }
        />
      }>
      <VStack gap={10} xstyle={styles.column}>
        {children}
        <VStack gap={3}>
          <Divider />
          <Text type="supporting">{t(site.footer.rights)}</Text>
        </VStack>
      </VStack>
    </AppShell>
  );
}
