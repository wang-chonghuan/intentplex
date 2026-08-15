import {createFileRoute} from '@tanstack/react-router';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

export const Route = createFileRoute('/admin/denied')({
  component: () => (
    <VStack gap={3}>
      <Heading level={1}>进不去</Heading>
      <Text type="body" color="secondary">
        这个后台只对一个 GitHub 账号开放，而你不是它。
      </Text>
    </VStack>
  ),
});
