import {EmptyState} from '@astryxdesign/core/EmptyState';
import {List, ListItem} from '@astryxdesign/core/List';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {site} from '~/content/site';
import {itemHref, leadOf, pickRendition, type Item} from '~/content/loader';
import {useLocale} from '~/i18n/locale';

/**
 * The one list on this site. Every page is a reverse-chronological run of
 * these rows — rows rather than cards, because these are scanned.
 *
 * A row carries four things and nothing else: picture, meta, title, lead.
 *
 * The meta line — ordinal and date — sits above the title on the left, the same
 * place PostList puts it. These two lists are read as one site; a reader should
 * not have to look in a different corner for the date depending on which page
 * they are on.
 *
 * `isNumbered` adds a running ordinal to a single collection — oldest is #1, so
 * the number counts up as you read back through time. Off by default because
 * the home feed mixes kinds, where a per-collection ordinal would be a lie.
 */
export function ItemList({
  items,
  isNumbered = false,
}: {
  items: readonly Item[];
  isNumbered?: boolean;
}) {
  const {locale, t} = useLocale();

  if (items.length === 0) {
    return <EmptyState title={t(site.list.empty)} isCompact />;
  }

  return (
    <List hasDividers density="spacious">
      {items.map((item, index) => {
        const href = itemHref(item);
        const {rendition} = pickRendition(item, locale);
        const ordinal = items.length - index;
        return (
          <ListItem
            key={`${item.kind}-${item.id}`}
            href={href ?? undefined}
            startContent={
              item.image ? <Thumbnail src={item.image} alt={rendition.title} /> : undefined
            }
            label={
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  {isNumbered && <Text type="supporting">#{ordinal}</Text>}
                  <Timestamp value={item.date} format="date" />
                </HStack>
                <Text type="label">{rendition.title}</Text>
              </VStack>
            }
            description={leadOf(rendition)}
          />
        );
      })}
    </List>
  );
}
