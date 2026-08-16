import {useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';

import {adminCopy} from '~/content/admin-copy';
import {CHANNELS} from '~/content/channels';
import {useLocale} from '~/i18n/locale';
import {
  adminGenerate,
  adminGetEntry,
  adminSaveRendition,
  adminSaveSyndication,
  adminSetChannelStatus,
  adminSyndications,
} from '~/rpc/admin';

/**
 * Review, then send.
 *
 * Two stages on purpose, and this is the second one. The English site version is
 * reviewed on its own because it is a permanent asset under the author's name —
 * `ui.md` makes reading it a condition of publishing. The four platform posts
 * are reviewed together because they are short and disposable.
 *
 * "发送" does not send. It marks the row approved; the sender runs on the
 * author's own machine, where the browser sessions are.
 */

export const Route = createFileRoute('/admin/syndicate/$id')({
  loader: async ({params}) => {
    const entry = await adminGetEntry({data: {entryId: params.id}});
    const channels = await adminSyndications({data: {entryId: params.id}});
    return {entry, channels};
  },
  component: SyndicatePage,
});


function SyndicatePage() {
  const {t} = useLocale();
  const c = adminCopy.syndicate;
  const initial = Route.useLoaderData();
  const [entry, setEntry] = useState(initial.entry);
  const [channels, setChannels] = useState(initial.channels);
  const [busy, setBusy] = useState<string | null>(null);

  const en = entry.renditions.find((r) => r.lang === 'en');
  const [enTitle, setEnTitle] = useState(en?.title ?? '');
  const [enBody, setEnBody] = useState(en?.body ?? '');

  async function generate() {
    setBusy(t(c.generating));
    try {
      const result = await adminGenerate({data: {entryId: entry.id}});
      setEnTitle(result.en.title);
      setEnBody(result.en.body);
      setChannels(await adminSyndications({data: {entryId: entry.id}}));
      setEntry(await adminGetEntry({data: {entryId: entry.id}}));
    } catch (error) {
      setBusy(t(adminCopy.errors.generateFailed) + (error as Error).message);
      return;
    }
    setBusy(null);
  }

  async function setChannelBody(channel: string, body: string) {
    setChannels((cs) => cs.map((c) => (c.channel === channel ? {...c, body} : c)));
    await adminSaveSyndication({data: {entryId: entry.id, channel, body}});
  }

  async function setChannelStatus(channel: string, status: string) {
    await adminSetChannelStatus({data: {entryId: entry.id, channel, status}});
    setChannels(await adminSyndications({data: {entryId: entry.id}}));
  }

  return (
    <VStack gap={8}>
      <VStack gap={2}>
        <Heading level={1}>{t(c.heading)}</Heading>
        <Text type="supporting" color="secondary">
          {t(c.lede)}
        </Text>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Button label={t(c.generate)} variant="primary" onClick={() => void generate()} isDisabled={busy != null} />
          {busy ? <Text type="supporting">{busy}</Text> : null}
        </HStack>
      </VStack>

      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Heading level={2}>{t(c.englishHeading)}</Heading>
          {en?.origin === 'generated' ? <Badge label={t(c.generatedBadge)} /> : null}
        </HStack>
        <TextInput label={t(c.englishTitle)} value={enTitle} onChange={setEnTitle} width="100%" />
        <TextArea label={t(c.englishBody)} value={enBody} onChange={setEnBody} width="100%" />
        <HStack wrap="wrap">
          <Button
            label={t(c.saveEnglish)}
            variant="secondary"
            isDisabled={enTitle.trim() === '' || enBody.trim() === ''}
            onClick={() =>
              void adminSaveRendition({
                data: {entryId: entry.id, lang: 'en', title: enTitle, body: enBody},
              })
            }
          />
        </HStack>
      </VStack>

      <VStack gap={4}>
        <Heading level={2}>{t(c.platformsHeading)}</Heading>
        {CHANNELS.map((meta) => {
          const row = channels.find((c) => c.channel === meta.id);
          const body = row?.body ?? '';
          const over = body.length > meta.limit;
          const sent = row?.status === 'posted' || row?.status === 'posting';

          return (
            <Card key={meta.id}>
              <VStack gap={3}>
                <HStack hAlign="between" vAlign="center" wrap="wrap">
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="body">{t(meta.label)}</Text>
                    <Text type="supporting" color={over ? 'accent' : 'secondary'}>
                      {body.length} / {meta.limit}
                    </Text>
                  </HStack>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="supporting" color="secondary">
                      {t(adminCopy.status[(row?.status ?? 'draft') as keyof typeof adminCopy.status])}
                    </Text>
                    {row?.remote_url ? (
                      <Link href={row.remote_url} isExternalLink>
                        {t(c.view)}
                      </Link>
                    ) : null}
                  </HStack>
                </HStack>

                <TextArea
                  label={`${t(meta.label)} — ${t(c.englishBody)}`}
                  width="100%"
                  isLabelHidden
                  value={body}
                  isReadOnly={sent}
                  onChange={(v) => void setChannelBody(meta.id, v)}
                />

                <HStack gap={2} wrap="wrap">
                  <Button
                    label={t(c.send)}
                    variant="primary"
                    isDisabled={sent || over || body.trim() === ''}
                    onClick={() => void setChannelStatus(meta.id, 'approved')}
                  />
                  <Button
                    label={t(c.skip)}
                    variant="secondary"
                    isDisabled={sent}
                    onClick={() => void setChannelStatus(meta.id, 'skip')}
                  />
                </HStack>
              </VStack>
            </Card>
          );
        })}
      </VStack>
    </VStack>
  );
}
