import {useMemo, useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {ItemList} from '~/components/ItemList';
import {ALL_TAGS, TagFilter, filterByTag} from '~/components/TagFilter';
import type {Item} from '~/content/items';
import type {L10n} from '~/i18n/locale';
import {useLocale} from '~/i18n/locale';

/**
 * posts, articles and works are the same page with different items: a heading,
 * the derived tag filter, and one reverse-chronological list. Keeping them one
 * component is what stops them drifting into three layouts again.
 */
export function ItemPage({title, items}: {title: L10n<string>; items: readonly Item[]}) {
  const {t} = useLocale();
  const [tag, setTag] = useState<string>(ALL_TAGS);

  const visible = useMemo(() => filterByTag(items, tag), [items, tag]);

  return (
    <VStack gap={5}>
      <Heading level={1}>{t(title)}</Heading>
      <TagFilter items={items} value={tag} onChange={setTag} />
      <ItemList items={visible} />
    </VStack>
  );
}
