import {createFileRoute} from '@tanstack/react-router';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {List} from '@astryxdesign/core/List';
import {ListItem} from '@astryxdesign/core/List';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';

import {AppLink} from '~/components/AppLink';
import {adminCopy} from '~/content/admin-copy';
import {useLocale} from '~/i18n/locale';
import {CHANNELS} from '~/content/channels';
import {adminList, adminPending} from '~/rpc/admin';

export const Route = createFileRoute('/admin/')({
  loader: async () => ({entries: await adminList(), pending: await adminPending()}),
  component: AdminIndex,
});

function AdminIndex() {
  const {t} = useLocale();
  const {entries, pending} = Route.useLoaderData();
  const c = adminCopy.pending;
  const channelLabel = (id: string) =>
    CHANNELS.find((ch) => ch.id === id)?.label ?? {en: id, zh: id};

  return (
    <VStack gap={6}>
      {/* Approving here writes a row and stops. Everything below is waiting on a
          person with a signed-in browser, and nothing else in the admin says so
          across entries. */}
      {pending.length > 0 ? (
        <Card>
          <VStack gap={3}>
            <Heading level={2}>{t(c.heading)}</Heading>
            <Text type="supporting" color="secondary">
              {t(c.lede)}
            </Text>
            <Text type="body">
              <code>{t(c.command)}</code>
            </Text>
            <List hasDividers>
              {pending.map((row) => (
                <ListItem
                  key={row.id}
                  label={`${row.slug} · ${t(channelLabel(row.channel))}`}
                  description={row.status === 'posting' ? t(c.stuck) : undefined}
                  endContent={
                    row.status === 'posting' ? (
                      <Badge label={t(adminCopy.status.posting)} />
                    ) : undefined
                  }
                />
              ))}
            </List>
          </VStack>
        </Card>
      ) : null}

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
