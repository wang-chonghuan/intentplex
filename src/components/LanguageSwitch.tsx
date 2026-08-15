import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

import {site} from '~/content/site';
import {useLocale, type Locale} from '~/i18n/locale';

/**
 * The bilingual toggle. A two-option SegmentedControl rather than a dropdown:
 * both destinations stay visible, which matters when a reader cannot read the
 * label of the language they are currently in.
 */
export function LanguageSwitch() {
  const {locale, setLocale, t} = useLocale();

  return (
    <SegmentedControl
      size="sm"
      label={t(site.languageSwitch.label)}
      value={locale}
      onChange={(next) => setLocale(next as Locale)}>
      <SegmentedControlItem value="en" label={site.languageSwitch.en} />
      <SegmentedControlItem value="zh" label={site.languageSwitch.zh} />
    </SegmentedControl>
  );
}
