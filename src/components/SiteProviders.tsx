import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import type {ThemeMode} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {stoneTheme} from '@astryxdesign/theme-stone/built';

import {AppLink} from '~/components/AppLink';
import {LocaleProvider} from '~/i18n/locale';

const MODE_STORAGE_KEY = 'intentplex.mode';
const MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

type ColorModeValue = {
  mode: ThemeMode;
  setMode: (next: ThemeMode) => void;
};

const ColorModeContext = createContext<ColorModeValue | null>(null);

function isMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/**
 * Everything the whole site depends on, in one place:
 *
 *   Theme          the stone theme, from its /built entry so the pre-compiled
 *                  theme.css carries token *and* component overrides through
 *                  SSR with no flash on hydration
 *   LinkProvider   makes every Astryx link render through the router
 *   LocaleProvider the EN/中文 state
 *
 * Colour mode starts at 'system' on the server and on the first client render,
 * then adopts a stored preference in an effect, so hydration never mismatches.
 */
export function SiteProviders({children}: {children: ReactNode}) {
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (isMode(stored) && stored !== 'system') {
      setModeState(stored);
    }
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(MODE_STORAGE_KEY, next);
  }, []);

  const colorMode = useMemo<ColorModeValue>(() => ({mode, setMode}), [mode, setMode]);

  return (
    <Theme theme={stoneTheme} mode={mode}>
      <ColorModeContext value={colorMode}>
        <LinkProvider component={AppLink}>
          <LocaleProvider>{children}</LocaleProvider>
        </LinkProvider>
      </ColorModeContext>
    </Theme>
  );
}

export function useColorMode(): ColorModeValue {
  const context = useContext(ColorModeContext);
  if (context == null) {
    throw new Error('useColorMode must be used inside SiteProviders');
  }
  return context;
}
