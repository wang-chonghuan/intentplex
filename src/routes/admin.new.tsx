import {createFileRoute} from '@tanstack/react-router';
import {Heading} from '@astryxdesign/core/Heading';
import {VStack} from '@astryxdesign/core/Stack';

import {adminCopy} from '~/content/admin-copy';
import {useLocale} from '~/i18n/locale';
import {EntryEditor} from '~/components/EntryEditor';

export const Route = createFileRoute('/admin/new')({
  component: NewEntryPage,
});

function NewEntryPage() {
  const {t} = useLocale();
  return (
    <VStack gap={5}>
      <Heading level={1}>{t(adminCopy.editor.newHeading)}</Heading>
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
