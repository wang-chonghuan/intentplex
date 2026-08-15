import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Markdown} from '@astryxdesign/core/Markdown';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {site} from '~/content/site';
import {leadOf, pickRendition, type Item} from '~/content/loader';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

/**
 * Posts, as collapsed rows that open in place.
 *
 * Posts have no detail page — the post *is* the content — but they run to a few
 * hundred words and often carry images, which a truncated list row throws away.
 * `CollapsibleGroup` with `hasDividers` keeps the scannable hairline rows the
 * other pages use and costs no custom CSS; `type="multiple"` lets several stay
 * open at once, since these are read in a run rather than chosen between.
 *
 * The group is **controlled** rather than uncontrolled for one reason: an open
 * row must drop its lead, because the lead is the first line of the body that
 * is now shown in full right underneath it. Knowing which rows are open is the
 * only way to do that, and Astryx exposes it through `value` / `onChange`.
 *
 * Every row is treated the same. An earlier version marked posts short enough
 * to read whole as `isDisabled`, which was wrong twice over: it dims the row to
 * 0.5 opacity as though it were unavailable, and it drops the row out of the
 * tab order — while still rendering the chevron, so the affordance stayed and
 * only the ability to use it went away.
 */
const LEAD_LIMIT = 220;

/**
 * The body with its images taken out, for a row that is still closed.
 *
 * A closed row's body is in the DOM and only hidden with CSS, and a hidden
 * `<img>` is still fetched — /posts pulled every full-size photo in the corpus,
 * four megabytes, to show sixty-two 64px thumbnails. Dropping the image syntax
 * while closed keeps the text server-rendered and indexable, which is the whole
 * reason the body is there at all, and defers the bytes to the click that
 * actually asks for them.
 */
function bodyWithoutImages(body: string): string {
  return body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\n{3,}/g, '\n\n');
}

const styles = stylex.create({
  body: {
    maxWidth: frame.proseWidth,
  },
});

export function PostList({items}: {items: readonly Item[]}) {
  const {locale, t} = useLocale();
  const [open, setOpen] = useState<string[]>([]);

  if (items.length === 0) {
    return <EmptyState title={t(site.list.empty)} isCompact />;
  }

  return (
    <CollapsibleGroup
      type="multiple"
      value={open}
      onChange={(next) => setOpen(Array.isArray(next) ? next : [next])}
      hasDividers
      density="spacious">
      {items.map((item, index) => {
        const {rendition} = pickRendition(item, locale);
        const isOpen = open.includes(item.id);
        // Oldest is #1, so it counts up as you scroll back through time.
        const ordinal = items.length - index;

        return (
          <Collapsible
            key={item.id}
            value={item.id}
            trigger={
              <HStack gap={3} vAlign="start">
                {item.image != null && (
                  <Thumbnail src={item.thumb ?? item.image} alt={rendition.title} />
                )}
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Text type="supporting">#{ordinal}</Text>
                    <Timestamp value={item.date} format="date" />
                  </HStack>
                  {/* Dropped once open — the body below opens with this same line. */}
                  {!isOpen && <Text type="body">{leadOf(rendition, LEAD_LIMIT)}</Text>}
                </VStack>
              </HStack>
            }>
            <VStack xstyle={styles.body}>
              <Markdown headingLevelStart={3}>
                {isOpen ? rendition.body : bodyWithoutImages(rendition.body)}
              </Markdown>
            </VStack>
          </Collapsible>
        );
      })}
    </CollapsibleGroup>
  );
}
