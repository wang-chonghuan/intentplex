import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu';
import type {ThemeMode} from '@astryxdesign/core/theme';
import {MonitorIcon, MoonIcon, SunIcon} from 'lucide-react';

import {useColorMode} from '~/components/SiteProviders';
import {site} from '~/content/site';
import {useLocale} from '~/i18n/locale';

const MODE_ICON = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
} as const;

/**
 * Light / dark / auto. A menu rather than a second SegmentedControl, so the
 * top bar keeps one dominant control — the language switch — instead of two
 * competing pill groups.
 */
export function AppearanceSwitch() {
  const {mode, setMode} = useColorMode();
  const {t} = useLocale();
  const label = t(site.appearance.label);
  const CurrentIcon = MODE_ICON[mode];

  return (
    <DropdownMenu
      hasChevron={false}
      menuWidth={176}
      alignment="end"
      button={{
        label,
        tooltip: label,
        variant: 'ghost',
        size: 'sm',
        isIconOnly: true,
        icon: <CurrentIcon />,
      }}>
      <DropdownMenuRadioGroup
        label={label}
        value={mode}
        onChange={(next: string) => setMode(next as ThemeMode)}>
        <DropdownMenuRadioItem
          value="system"
          label={t(site.appearance.system)}
          icon={MonitorIcon}
        />
        <DropdownMenuRadioItem
          value="light"
          label={t(site.appearance.light)}
          icon={SunIcon}
        />
        <DropdownMenuRadioItem
          value="dark"
          label={t(site.appearance.dark)}
          icon={MoonIcon}
        />
      </DropdownMenuRadioGroup>
    </DropdownMenu>
  );
}
