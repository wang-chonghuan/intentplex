import {EmptyState} from '@astryxdesign/core/EmptyState';
import {List, ListItem} from '@astryxdesign/core/List';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {site} from '~/content/site';
import {itemHref, type Item} from '~/content/items';
import {tagLabel} from '~/content/tags';
import {useLocale} from '~/i18n/locale';

/**
 * The one list on this site. Every page is a reverse-chronological run of
 * these rows — rows rather than cards, because these are scanned, and a grid of
 * cards would make five pages that all read as a prototype.
 *
 * The picture is a `Thumbnail`, which owns its own size. An `AspectRatio` with
 * a width would work too, but that width is a raw length in `src/`, which
 * `charter/ui.md` forbids — and the component built for "preview image in a
 * row" is the answer the design system already has.
 */
export function ItemList({items}: {items: readonly Item[]}) {
  const {t} = useLocale();

  if (items.length === 0) {
    return <EmptyState title={t(site.filter.empty)} isCompact />;
  }

  return (
    <List hasDividers density="spacious">
      {items.map((item) => {
        const href = itemHref(item);
        return (
          <ListItem
            key={`${item.kind}-${item.id}`}
            href={href ?? undefined}
            startContent={<Thumbnail src={item.image.src} alt={t(item.image.alt)} />}
            label={t(item.title)}
            description={t(item.summary)}
            endContent={
              <VStack gap={1} hAlign="end">
                <Timestamp value={item.date} format="date" />
                <HStack gap={1} wrap="wrap" hAlign="end">
                  {item.tags.map((tag) => (
                    <Text key={tag} type="supporting">
                      {t(tagLabel(tag))}
                    </Text>
                  ))}
                </HStack>
              </VStack>
            }
          />
        );
      })}
    </List>
  );
}
