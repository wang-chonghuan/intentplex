import {createFileRoute} from '@tanstack/react-router';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {AppLink} from '~/components/AppLink';
import {EntryEditor} from '~/components/EntryEditor';
import {adminGetEntry} from '~/rpc/admin';

export const Route = createFileRoute('/admin/edit/$id')({
  loader: ({params}) => adminGetEntry({data: {entryId: params.id}}),
  component: EditEntryPage,
});

function EditEntryPage() {
  const entry = Route.useLoaderData();
  const zh = entry.renditions.find((r) => r.lang === 'zh');

  return (
    <VStack gap={5}>
      <Heading level={1}>{zh?.title || entry.slug}</Heading>
      <AppLink href={`/admin/syndicate/${entry.id}`}>生成与同步 →</AppLink>
      <EntryEditor
        initial={{
          id: entry.id,
          kind: entry.kind,
          slug: entry.slug,
          date: entry.date,
          status: entry.status,
          coverPath: entry.coverPath,
          titleZh: zh?.title ?? '',
          bodyZh: zh?.body ?? '',
        }}
      />
    </VStack>
  );
}
