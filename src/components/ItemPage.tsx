import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {ItemList} from '~/components/ItemList';
import type {Item} from '~/content/items';
import type {L10n} from '~/i18n/locale';
import {useLocale} from '~/i18n/locale';

/**
 * posts, articles and works are the same page with different items: a heading
 * and one reverse-chronological list. Nothing else — no filter, no grouping,
 * no summary block. Keeping them one component is what stops them drifting
 * into three layouts again.
 */
export function ItemPage({title, items}: {title: L10n<string>; items: readonly Item[]}) {
  const {t} = useLocale();

  return (
    <VStack gap={5}>
      <Heading level={1}>{t(title)}</Heading>
      <ItemList items={items} />
    </VStack>
  );
}
