import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {ItemList} from '~/components/ItemList';
import {home} from '~/content/home';
import {recentItems} from '~/content/items';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const styles = stylex.create({
  headline: {
    maxWidth: '16ch',
  },
  intro: {
    maxWidth: frame.proseWidth,
  },
});

const RECENT_COUNT = 8;

function HomePage() {
  const {t} = useLocale();

  return (
    <VStack gap={10}>
      <VStack gap={4}>
        <Heading level={1} type="display-2" xstyle={styles.headline}>
          {home.headline}
        </Heading>
        <Text type="large" color="secondary" xstyle={styles.intro}>
          {t(home.intro)}
        </Text>
      </VStack>

      <VStack gap={4}>
        <Heading level={2}>{t(home.recentHeading)}</Heading>
        <ItemList items={recentItems(RECENT_COUNT)} />
      </VStack>
    </VStack>
  );
}
