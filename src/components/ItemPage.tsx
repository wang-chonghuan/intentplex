import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {ItemList} from '~/components/ItemList';
import {PostList} from '~/components/PostList';
import type {Item} from '~/content/loader';
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
  // Posts open in place because they have no detail page; the others link out.
  const isPosts = items[0]?.kind === 'post';

  return (
    <VStack gap={5}>
      <Heading level={1}>{t(title)}</Heading>
      {isPosts ? (
        <PostList items={items} />
      ) : (
        <ItemList items={items} isNumbered={items[0]?.kind === 'article'} />
      )}
    </VStack>
  );
}
