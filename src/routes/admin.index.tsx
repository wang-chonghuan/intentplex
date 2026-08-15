import {createFileRoute} from '@tanstack/react-router';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {List} from '@astryxdesign/core/List';
import {ListItem} from '@astryxdesign/core/List';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {AppLink} from '~/components/AppLink';
import {adminCopy} from '~/content/admin-copy';
import {useLocale} from '~/i18n/locale';
import {adminList} from '~/rpc/admin';

export const Route = createFileRoute('/admin/')({
  loader: () => adminList(),
  component: AdminIndex,
});

function AdminIndex() {
  const {t} = useLocale();
  const entries = Route.useLoaderData();

  return (
    <VStack gap={6}>
      <HStack hAlign="between" vAlign="center">
        <Heading level={1}>{t(adminCopy.index.heading)}</Heading>
        <AppLink href="/admin/new">
          <Button label={t(adminCopy.index.write)} variant="primary" />
        </AppLink>
      </HStack>

      <List hasDividers>
        {entries.map((entry) => (
          <ListItem
            key={entry.id}
            href={`/admin/edit/${entry.id}`}
            label={entry.slug}
            description={
              <HStack gap={2} vAlign="center">
                <Timestamp value={entry.date} format="date" />
                <Text type="supporting" color="secondary">
                  {entry.kind}
                </Text>
                <Text type="supporting" color="secondary">
                  {entry.langs.filter(Boolean).join(' / ') || t(adminCopy.index.noLanguages)}
                </Text>
              </HStack>
            }
            endContent={entry.status === 'published' ? undefined : <Badge label={t(adminCopy.index.draft)} />}
          />
        ))}
      </List>
    </VStack>
  );
}
