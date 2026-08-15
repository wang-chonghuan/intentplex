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

import {CHANNELS} from '~/content/channels';
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
  loader: async ({params}) => ({
    entry: await adminGetEntry({data: {entryId: params.id}}),
    channels: await adminSyndications({data: {entryId: params.id}}),
  }),
  component: SyndicatePage,
});

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  approved: '已批准，等待本机发送',
  posting: '发送中',
  posted: '已发送',
  skip: '不发这个平台',
};

function SyndicatePage() {
  const initial = Route.useLoaderData();
  const [entry, setEntry] = useState(initial.entry);
  const [channels, setChannels] = useState(initial.channels);
  const [busy, setBusy] = useState<string | null>(null);

  const en = entry.renditions.find((r) => r.lang === 'en');
  const [enTitle, setEnTitle] = useState(en?.title ?? '');
  const [enBody, setEnBody] = useState(en?.body ?? '');

  async function generate() {
    setBusy('生成中，五份…');
    try {
      const result = await adminGenerate({data: {entryId: entry.id}});
      setEnTitle(result.en.title);
      setEnBody(result.en.body);
      setChannels(await adminSyndications({data: {entryId: entry.id}}));
      setEntry(await adminGetEntry({data: {entryId: entry.id}}));
    } catch (error) {
      setBusy(`生成失败：${(error as Error).message}`);
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
        <Heading level={1}>生成与同步</Heading>
        <Text type="supporting" color="secondary">
          中文原文是唯一手写的。英文站点版与四个平台版本都由这里生成，发布前你要读过。
        </Text>
        <HStack gap={3} vAlign="center">
          <Button label="生成五份" variant="primary" onClick={() => void generate()} isDisabled={busy != null} />
          {busy ? <Text type="supporting">{busy}</Text> : null}
        </HStack>
      </VStack>

      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>英文站点版</Heading>
          {en?.origin === 'generated' ? <Badge label="机器生成，需你过目" /> : null}
        </HStack>
        <TextInput label="English title" value={enTitle} onChange={setEnTitle} />
        <TextArea label="English body" value={enBody} onChange={setEnBody} />
        <HStack>
          <Button
            label="保存英文版"
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
        <Heading level={2}>四个平台</Heading>
        {CHANNELS.map((meta) => {
          const row = channels.find((c) => c.channel === meta.id);
          const body = row?.body ?? '';
          const over = body.length > meta.limit;
          const sent = row?.status === 'posted' || row?.status === 'posting';

          return (
            <Card key={meta.id}>
              <VStack gap={3}>
                <HStack hAlign="between" vAlign="center">
                  <HStack gap={2} vAlign="center">
                    <Text type="body">{meta.label}</Text>
                    <Text type="supporting" color={over ? 'accent' : 'secondary'}>
                      {body.length} / {meta.limit}
                    </Text>
                  </HStack>
                  <HStack gap={2} vAlign="center">
                    <Text type="supporting" color="secondary">
                      {STATUS_LABEL[row?.status ?? 'draft']}
                    </Text>
                    {row?.remote_url ? (
                      <Link href={row.remote_url} isExternalLink>
                        看一眼
                      </Link>
                    ) : null}
                  </HStack>
                </HStack>

                <TextArea
                  label={`${meta.label} 正文`}
                  isLabelHidden
                  value={body}
                  isReadOnly={sent}
                  onChange={(v) => void setChannelBody(meta.id, v)}
                />

                <HStack gap={2}>
                  <Button
                    label="发送"
                    variant="primary"
                    isDisabled={sent || over || body.trim() === ''}
                    onClick={() => void setChannelStatus(meta.id, 'approved')}
                  />
                  <Button
                    label="不发"
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
