import {createFileRoute} from '@tanstack/react-router';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {EntryEditor} from '~/components/EntryEditor';

export const Route = createFileRoute('/admin/new')({
  component: NewEntryPage,
});

function NewEntryPage() {
  return (
    <VStack gap={5}>
      <Heading level={1}>写新的</Heading>
      <EntryEditor
        initial={{
          kind: 'post',
          slug: '',
          date: new Date().toISOString(),
          status: 'draft',
          coverPath: null,
          titleZh: '',
          bodyZh: '',
        }}
      />
    </VStack>
  );
}
