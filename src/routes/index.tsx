import {createFileRoute, useNavigate} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading} from '@astryxdesign/core/Heading';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';

import {home} from '~/content/home';
import {site} from '~/content/site';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const styles = stylex.create({
  // The hero is the one region allowed to break the reading column: the
  // headline wants to run wider than body copy, the intro must not.
  headline: {
    maxWidth: '20ch',
  },
  intro: {
    maxWidth: frame.proseWidth,
  },
});

function HomePage() {
  const {t} = useLocale();
  const navigate = useNavigate();

  return (
    <VStack gap={10}>
      <VStack gap={5}>
        <HStack gap={3} vAlign="center">
          <Avatar name={site.name} size="lg" />
          <VStack gap={0.5}>
            <Text type="label">{site.name}</Text>
            <Text type="supporting">{t(home.eyebrow)}</Text>
          </VStack>
        </HStack>

        <Heading level={1} type="display-2" xstyle={styles.headline}>
          {t(home.headline)}
        </Heading>

        <Text type="large" color="secondary" xstyle={styles.intro}>
          {t(home.intro)}
        </Text>

        <HStack gap={2} wrap="wrap">
          <Button
            variant="primary"
            label={t(home.actions.readEssays)}
            onClick={() => navigate({to: '/essays'})}
          />
          <Button
            label={t(home.actions.seeWork)}
            onClick={() => navigate({to: '/work'})}
          />
        </HStack>
      </VStack>

      <Divider />

      <VStack gap={4}>
        <Heading level={2}>{t(home.nowHeading)}</Heading>
        <List hasDividers density="spacious">
          {home.now.map((entry) => (
            <ListItem
              key={entry.id}
              startContent={<StatusDot variant={entry.status} label={t(entry.label)} />}
              label={t(entry.title)}
              description={t(entry.detail)}
              endContent={<Text type="supporting">{t(entry.label)}</Text>}
            />
          ))}
        </List>
      </VStack>

      <VStack gap={4}>
        <Heading level={2}>{t(home.interestsHeading)}</Heading>
        <Grid columns={{minWidth: 260, max: 3}} gap={3}>
          {home.interests.map((interest) => (
            <Card key={interest.id} variant={interest.variant} padding={5}>
              <VStack gap={2}>
                <Heading level={3}>{t(interest.name)}</Heading>
                <Text type="body">{t(interest.body)}</Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>

      <VStack gap={4}>
        <Heading level={2}>{t(home.factsHeading)}</Heading>
        <MetadataList columns={2} label={{position: 'top'}}>
          {home.facts.map((fact) => (
            <MetadataListItem key={fact.id} label={t(fact.label)}>
              <Text type="body">{t(fact.value)}</Text>
            </MetadataListItem>
          ))}
        </MetadataList>
      </VStack>
    </VStack>
  );
}
