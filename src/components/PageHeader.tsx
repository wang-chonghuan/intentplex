import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

import {frame} from '~/styles/tokens.stylex';

const styles = stylex.create({
  lede: {
    maxWidth: frame.proseWidth,
  },
});

/**
 * The h1 block every route opens with. AppShell renders no heading of its own,
 * so this is the page's document outline entry point.
 */
export function PageHeader({
  title,
  lede,
  aside,
}: {
  title: string;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <VStack gap={3}>
      <HStack gap={4} hAlign="between" vAlign="center" wrap="wrap">
        <Heading level={1}>{title}</Heading>
        {aside}
      </HStack>
      <Text type="large" color="secondary" xstyle={styles.lede}>
        {lede}
      </Text>
    </VStack>
  );
}
