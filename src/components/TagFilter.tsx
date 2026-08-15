import * as stylex from '@stylexjs/stylex';
import {HStack} from '@astryxdesign/core/Stack';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';

import {site} from '~/content/site';
import type {Item} from '~/content/items';
import {tagLabel} from '~/content/tags';
import {useLocale} from '~/i18n/locale';

export const ALL_TAGS = '__all__';

/**
 * Every tag carried by these items, in first-appearance order.
 *
 * The filter row is derived, never enumerated: adding an item with a new tag
 * makes that filter appear, and removing the last item carrying a tag makes it
 * disappear. A hand-kept list of tags is the thing this replaces.
 */
export function collectTags(items: readonly Item[]): readonly string[] {
  const seen: string[] = [];
  for (const item of items) {
    for (const tag of item.tags) {
      if (!seen.includes(tag)) seen.push(tag);
    }
  }
  return seen;
}

export function filterByTag(items: readonly Item[], tag: string): readonly Item[] {
  return tag === ALL_TAGS ? items : items.filter((item) => item.tags.includes(tag));
}

const styles = stylex.create({
  // A vertical stack stretches its children; the filter row hugs its buttons.
  row: {
    alignSelf: 'flex-start',
  },
});

export function TagFilter({
  items,
  value,
  onChange,
}: {
  items: readonly Item[];
  value: string;
  onChange: (next: string) => void;
}) {
  const {t} = useLocale();
  const tags = collectTags(items);

  return (
    <HStack
      gap={1}
      wrap="wrap"
      xstyle={styles.row}
      role="group"
      aria-label={t(site.filter.label)}>
      <ToggleButton
        size="sm"
        label={t(site.filter.all)}
        isPressed={value === ALL_TAGS}
        onPressedChange={() => onChange(ALL_TAGS)}
      />
      {tags.map((tag) => (
        <ToggleButton
          key={tag}
          size="sm"
          label={t(tagLabel(tag))}
          isPressed={value === tag}
          onPressedChange={() => onChange(value === tag ? ALL_TAGS : tag)}
        />
      ))}
    </HStack>
  );
}
