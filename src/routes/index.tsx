import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {ItemList} from '~/components/ItemList';
import {home} from '~/content/home';
import {recentItems} from '~/content/loader';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const styles = stylex.create({
  // The headline gets no width budget of its own: it should occupy one line
  // and only wrap when the viewport actually forces it. The intro still reads
  // as prose, so it keeps the reading column.
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
        <Heading level={1} type="display-2">
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
