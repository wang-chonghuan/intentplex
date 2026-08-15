import * as stylex from '@stylexjs/stylex';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {Markdown} from '@astryxdesign/core/Markdown';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {site} from '~/content/site';
import {pickRendition, type Item} from '~/content/loader';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

const styles = stylex.create({
  prose: {
    maxWidth: frame.proseWidth,
  },
});

/** The detail page for an article or a work. Nothing else has one. */
export function ItemDetail({item, backHref}: {item: Item; backHref: string}) {
  const {locale, t} = useLocale();
  const {rendition, isFallback} = pickRendition(item, locale);

  return (
    <VStack gap={6}>
      <Link href={backHref} isStandalone>
        {t(site.detail.back)}
      </Link>

      <VStack gap={3}>
        <Heading level={1} xstyle={styles.prose}>
          {rendition.title}
        </Heading>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Timestamp value={item.date} format="date_long" />
          {isFallback && (
            <Text type="supporting">{t(site.detail.originalLanguage)}</Text>
          )}
          {rendition.source != null && (
            <Link href={rendition.source} isExternalLink>
              {t(site.detail.source)}
            </Link>
          )}
        </HStack>
      </VStack>

      {/* headingLevelStart=2 keeps the page's h1 the only h1. */}
      <Markdown headingLevelStart={2} contentWidth="68ch" xstyle={styles.prose}>
        {rendition.body}
      </Markdown>
    </VStack>
  );
}
