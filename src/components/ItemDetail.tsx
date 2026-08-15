import * as stylex from '@stylexjs/stylex';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {site} from '~/content/site';
import type {Item} from '~/content/items';
import {tagLabel} from '~/content/tags';
import {useLocale} from '~/i18n/locale';
import {frame, radius} from '~/styles/tokens.stylex';

const styles = stylex.create({
  prose: {
    maxWidth: frame.proseWidth,
  },
  cover: {
    borderRadius: radius.container,
    overflow: 'hidden',
    maxWidth: frame.proseWidth,
  },
  image: {
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
});

/** The detail page for an article or a work. Nothing else has one. */
export function ItemDetail({item, backHref}: {item: Item; backHref: string}) {
  const {t} = useLocale();

  return (
    <VStack gap={6}>
      <Link href={backHref} isStandalone>
        {t(site.detail.back)}
      </Link>

      <VStack gap={3}>
        <Heading level={1} xstyle={styles.prose}>
          {t(item.title)}
        </Heading>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Timestamp value={item.date} format="date_long" />
          {item.tags.map((tag) => (
            <Text key={tag} type="supporting">
              {t(tagLabel(tag))}
            </Text>
          ))}
        </HStack>
      </VStack>

      <AspectRatio ratio={16 / 9} fit="cover" xstyle={styles.cover}>
        <img
          src={item.image.src}
          alt={t(item.image.alt)}
          {...stylex.props(styles.image)}
        />
      </AspectRatio>

      <VStack gap={4} xstyle={styles.prose}>
        <Text type="large" color="secondary">
          {t(item.summary)}
        </Text>
        {(item.body ? t(item.body) : []).map((paragraph, index) => (
          <Text key={index} type="body" as="p" display="block">
            {paragraph}
          </Text>
        ))}
      </VStack>
    </VStack>
  );
}
