import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {ItemList} from '~/components/ItemList';
import {home} from '~/content/home';
import {useLocale} from '~/i18n/locale';
import {listRecent} from '~/server/content';
import {frame} from '~/styles/tokens.stylex';

const RECENT_COUNT = 8;

export const Route = createFileRoute('/')({
  loader: () => listRecent({data: RECENT_COUNT}),
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
        <ItemList items={Route.useLoaderData()} />
      </VStack>
    </VStack>
  );
}
