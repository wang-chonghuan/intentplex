import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Text} from '@astryxdesign/core/Text';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {useRouterState} from '@tanstack/react-router';
import {HexagonIcon} from 'lucide-react';

import {AppearanceSwitch} from '~/components/AppearanceSwitch';
import {LanguageSwitch} from '~/components/LanguageSwitch';
import {site} from '~/content/site';
import {useLocale} from '~/i18n/locale';
import {frame, space} from '~/styles/tokens.stylex';

/**
 * Frame — a single content column under a top nav, the archetype the Astryx
 * layout guide calls a "plain content column" (documents, marketing).
 *
 * Responsive contract:
 *   > 1080px  centred 1080px column, 32px gutters
 *   <= 1080px column fills the viewport, gutters shrink to 16px
 *   <= 768px  AppShell folds the nav items into its own mobile drawer
 */
const NAV_ITEMS = [
  {to: '/', key: 'home'},
  {to: '/posts', key: 'posts'},
  {to: '/essays', key: 'essays'},
  {to: '/work', key: 'work'},
  {to: '/media', key: 'media'},
] as const;

const styles = stylex.create({
  column: {
    // The page's one width budget. Everything else derives from Astryx
    // spacing props; this is the only measurement the site owns.
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
      variant="section"
      contentPadding={0}
      topNav={
        <TopNav
          label={t(site.nav.home)}
          heading={
            <TopNavHeading
              heading={site.wordmark}
              subheading={t(site.tagline)}
              headingHref="/"
              logo={<NavIcon icon={<HexagonIcon />} />}
            />
          }
          startContent={NAV_ITEMS.map(({to, key}) => (
            <TopNavItem
              key={to}
              href={to}
              label={t(site.nav[key])}
              isSelected={to === '/' ? pathname === '/' : pathname.startsWith(to)}
            />
          ))}
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
          <HStack gap={3} hAlign="between" wrap="wrap">
            <Text type="supporting">{t(site.footer.note)}</Text>
            <Text type="supporting">{t(site.footer.rights)}</Text>
          </HStack>
        </VStack>
      </VStack>
    </AppShell>
  );
}
