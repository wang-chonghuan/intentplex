import {createFileRoute} from '@tanstack/react-router';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Section} from '@astryxdesign/core/Section';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {PageHeader} from '~/components/PageHeader';
import {channels, mediaPage} from '~/content/media';
import {useLocale} from '~/i18n/locale';

export const Route = createFileRoute('/media')({
  component: MediaPage,
});

function MediaPage() {
  const {t} = useLocale();
  const primary = channels.filter((channel) => channel.isPrimary);
  const secondary = channels.filter((channel) => !channel.isPrimary);

  return (
    <VStack gap={8}>
      <PageHeader title={t(mediaPage.title)} lede={t(mediaPage.lede)} />

      {/* An editorial aside, not a system alert — Section, not Banner. */}
      <Section variant="muted" padding={5}>
        <Text type="body" color="secondary">
          {t(mediaPage.crosspostNote)}
        </Text>
      </Section>

      <VStack gap={3}>
        <Heading level={2}>{t(mediaPage.primaryHeading)}</Heading>
        <Grid columns={{minWidth: 300, max: 3}} gap={4}>
          {primary.map((channel) => (
            <Card key={channel.id} variant={channel.accent} padding={5}>
              <VStack gap={3}>
                <VStack gap={1}>
                  <Heading level={3}>{channel.name}</Heading>
                  <Text type="supporting">{channel.handle}</Text>
                </VStack>

                <Text type="body">{t(channel.what)}</Text>

                <MetadataList columns="single" label={{position: 'start', width: 96}}>
                  <MetadataListItem label={t(mediaPage.cadenceLabel)}>
                    <Text type="supporting">{t(channel.cadence)}</Text>
                  </MetadataListItem>
                  <MetadataListItem label={t(mediaPage.audienceLabel)}>
                    <Text type="supporting">{channel.audience}</Text>
                  </MetadataListItem>
                  <MetadataListItem label={t(mediaPage.languageLabel)}>
                    <Text type="supporting">
                      {t(mediaPage.languageValue[channel.language])}
                    </Text>
                  </MetadataListItem>
                </MetadataList>

                <Link href={channel.href} isExternalLink isStandalone>
                  {t(mediaPage.followLabel)}
                </Link>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>

      <Divider />

      <VStack gap={3}>
        <Heading level={2}>{t(mediaPage.secondaryHeading)}</Heading>
        <List hasDividers density="spacious">
          {secondary.map((channel) => (
            <ListItem
              key={channel.id}
              href={channel.href}
              target="_blank"
              label={
                <HStack gap={2} vAlign="center">
                  <Text type="label">{channel.name}</Text>
                  <Badge
                    variant="neutral"
                    label={t(mediaPage.languageValue[channel.language])}
                  />
                </HStack>
              }
              description={t(channel.what)}
              endContent={
                <VStack gap={0.5} hAlign="end">
                  <Text type="supporting">{channel.audience}</Text>
                  <Text type="supporting">{t(channel.cadence)}</Text>
                </VStack>
              }
            />
          ))}
        </List>
      </VStack>
    </VStack>
  );
}
