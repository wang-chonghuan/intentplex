import {createFileRoute} from '@tanstack/react-router';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {adminCopy} from '~/content/admin-copy';
import {useLocale} from '~/i18n/locale';

export const Route = createFileRoute('/admin/denied')({
  component: DeniedPage,
});

function DeniedPage() {
  const {t} = useLocale();
  const c = adminCopy.denied;

  return (
    <VStack gap={3}>
      <Heading level={1}>{t(c.heading)}</Heading>
      <Text type="body" color="secondary">
        {t(c.body)}
      </Text>
      {/* Without this the page is a dead end: the visitor is turned away and
          left with no way back to the site they came from. */}
      <Link href="/">{t(c.home)}</Link>
    </VStack>
  );
}
