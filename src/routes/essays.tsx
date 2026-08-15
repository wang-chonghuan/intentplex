import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Badge} from '@astryxdesign/core/Badge';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {PageHeader} from '~/components/PageHeader';
import {essays, essaysPage, type Essay} from '~/content/essays';
import {useLocale, type Locale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/essays')({
  component: EssaysPage,
});

const styles = stylex.create({
  prose: {
    maxWidth: frame.proseWidth,
  },
});

const LANGUAGE_NAME: Record<Locale, string> = {en: 'EN', zh: '中文'};

function EssaysPage() {
  const {locale, t} = useLocale();
  const [featured, ...archive] = essays;

  return (
    <VStack gap={8}>
      <PageHeader title={t(essaysPage.title)} lede={t(essaysPage.lede)} />

      <VStack gap={3}>
        <Text type="label" color="secondary">
          {t(essaysPage.featuredLabel)}
        </Text>
        <Card padding={6} elevation="low">
          <VStack gap={4}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Badge
                variant="blue"
                label={t(essaysPage.series[featured.series])}
              />
              <Timestamp value={featured.date} format="date_long" />
              <Text type="supporting">
                {essaysPage.readingTime[locale](featured.minutes)}
              </Text>
            </HStack>

            <Heading level={2}>{t(featured.title)}</Heading>

            <Text type="body" color="secondary" xstyle={styles.prose}>
              {t(featured.summary)}
            </Text>

            {featured.pullQuote != null && (
              <Blockquote xstyle={styles.prose}>
                {t(featured.pullQuote)}
              </Blockquote>
            )}

            <HStack gap={2} vAlign="center">
              <Text type="supporting">{t(essaysPage.languageNote)}</Text>
              <LanguageTags essay={featured} />
            </HStack>
          </VStack>
        </Card>
      </VStack>

      <Divider />

      <VStack gap={3}>
        <Heading level={2}>{t(essaysPage.archiveLabel)}</Heading>
        <List hasDividers density="spacious">
          {archive.map((essay) => (
            <ListItem
              key={essay.id}
              label={<Link href="#">{t(essay.title)}</Link>}
              description={t(essay.summary)}
              endContent={
                <VStack gap={1} hAlign="end">
                  <Timestamp value={essay.date} format="date" />
                  <Text type="supporting">
                    {essaysPage.readingTime[locale](essay.minutes)}
                  </Text>
                </VStack>
              }
              startContent={
                <Badge variant="neutral" label={t(essaysPage.series[essay.series])} />
              }
            />
          ))}
        </List>
      </VStack>
    </VStack>
  );
}

function LanguageTags({essay}: {essay: Essay}) {
  return (
    <HStack gap={1}>
      {essay.publishedIn.map((code) => (
        <Badge key={code} variant="neutral" label={LANGUAGE_NAME[code]} />
      ))}
    </HStack>
  );
}
