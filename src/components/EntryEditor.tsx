import {useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Markdown} from '@astryxdesign/core/Markdown';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';

import {adminCopy} from '~/content/admin-copy';
import type {ItemKind} from '~/content/loader';
import {useLocale} from '~/i18n/locale';
import {adminSave, adminUpload} from '~/rpc/admin';
import {frame} from '~/styles/tokens.stylex';

/**
 * Writing an entry.
 *
 * One column, Chinese. The English version and the four platform posts are
 * generated from what is typed here, so there is nothing to write twice and no
 * second pane to keep in sync — see `channels.ts` and `generate.ts`.
 *
 * The preview uses the same `Markdown` component the public site renders with,
 * so what is shown here is what will be published rather than an approximation
 * by a second renderer.
 */

const styles = stylex.create({
  pane: {maxWidth: frame.proseWidth},
  editorHeight: {minHeight: '24rem'},
});

export type EditorEntry = {
  id?: string;
  kind: ItemKind;
  slug: string;
  date: string;
  status: string;
  coverPath: string | null;
  titleZh: string;
  bodyZh: string;
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export function EntryEditor({initial}: {initial: EditorEntry}) {
  const {t} = useLocale();
  const c = adminCopy.editor;
  const [entry, setEntry] = useState(initial);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof EditorEntry>(key: K, value: EditorEntry[K]) =>
    setEntry((e) => ({...e, [key]: value}));

  async function upload(file: File): Promise<string> {
    const path = await adminUpload({
      data: {name: file.name, base64: await fileToBase64(file)},
    });
    return path.path;
  }

  /** Paste or drop a picture and it lands in the body where the cursor is. */
  async function insertImage(file: File) {
    setBusy(t(c.uploading));
    try {
      const path = await upload(file);
      const textarea = bodyRef.current;
      const at = textarea?.selectionStart ?? entry.bodyZh.length;
      const snippet = `\n![](${path})\n`;
      set('bodyZh', entry.bodyZh.slice(0, at) + snippet + entry.bodyZh.slice(at));
      setMessage(t(c.inserted) + path);
    } catch (error) {
      setMessage(t(adminCopy.errors.uploadFailed) + (error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function save(status: 'draft' | 'published') {
    setBusy(t(status === 'published' ? c.publishing : c.saving));
    try {
      const saved = await adminSave({
        data: {
          id: entry.id,
          kind: entry.kind,
          slug: entry.slug,
          date: entry.date,
          coverPath: entry.coverPath,
          titleZh: entry.titleZh,
          bodyZh: entry.bodyZh,
          status,
        },
      });
      setEntry((e) => ({...e, id: saved.id, status}));
      setMessage(t(status === 'published' ? c.published : c.savedDraft));
    } catch (error) {
      setMessage(t(adminCopy.errors.saveFailed) + (error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <VStack gap={5}>
      <HStack gap={3} vAlign="end">
        <TextInput
          label={t(c.title)}
          value={entry.titleZh}
          onChange={(v) => set('titleZh', v)}
          isRequired
        />
        <TextInput label={t(c.slug)} value={entry.slug} onChange={(v) => set('slug', v)} isRequired />
      </HStack>

      <HStack gap={3} vAlign="end">
        <TextInput
          label={t(c.date)}
          value={entry.date.slice(0, 10)}
          onChange={(v) => set('date', new Date(`${v}T12:00:00.000Z`).toISOString())}
        />
        <SegmentedControl
          label={t(c.kind)}
          value={entry.kind}
          onChange={(v) => set('kind', v as ItemKind)}>
          <SegmentedControlItem value="post" label={t(c.kindPost)} />
          <SegmentedControlItem value="article" label={t(c.kindArticle)} />
          <SegmentedControlItem value="work" label={t(c.kindWork)} />
        </SegmentedControl>
      </HStack>

      <Card>
        <HStack gap={3} vAlign="center">
          {entry.coverPath ? <Thumbnail src={entry.coverPath} alt={t(c.cover)} /> : null}
          <VStack gap={1}>
            <Text type="body">{t(c.cover)}</Text>
            <Text type="supporting" color="secondary">
              {entry.coverPath ?? t(c.coverNone)}
            </Text>
          </VStack>
          <Button
            label={t(c.coverChoose)}
            variant="secondary"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                setBusy(t(c.uploadingCover));
                try {
                  set('coverPath', await upload(file));
                } finally {
                  setBusy(null);
                }
              };
              input.click();
            }}
          />
        </HStack>
      </Card>

      <SegmentedControl label={t(c.view)} value={tab} onChange={(v) => setTab(v as 'write' | 'preview')}>
        <SegmentedControlItem value="write" label={t(c.viewWrite)} />
        <SegmentedControlItem value="preview" label={t(c.viewPreview)} />
      </SegmentedControl>

      {tab === 'write' ? (
        <TextArea
          ref={bodyRef}
          label={t(c.body)}
          value={entry.bodyZh}
          onChange={(v) => set('bodyZh', v)}
          placeholder={t(c.bodyPlaceholder)}
          xstyle={styles.editorHeight}
          onPaste={(event: React.ClipboardEvent) => {
            const file = [...event.clipboardData.files][0];
            if (file?.type.startsWith('image/')) {
              event.preventDefault();
              void insertImage(file);
            }
          }}
          onDrop={(event: React.DragEvent) => {
            const file = [...event.dataTransfer.files][0];
            if (file?.type.startsWith('image/')) {
              event.preventDefault();
              void insertImage(file);
            }
          }}
        />
      ) : (
        <VStack xstyle={styles.pane}>
          <Markdown headingLevelStart={2}>{entry.bodyZh || t(c.bodyEmpty)}</Markdown>
        </VStack>
      )}

      <HStack gap={3} vAlign="center">
        <Button label={t(c.publish)} onClick={() => void save('published')} isDisabled={busy != null} variant="primary" />
        <Button label={t(c.saveDraft)} variant="secondary" onClick={() => void save('draft')} isDisabled={busy != null} />
        {busy ? <Text type="supporting">{busy}</Text> : null}
        {message ? (
          <Text type="supporting" color="secondary">
            {message}
          </Text>
        ) : null}
      </HStack>

      {entry.id ? (
        <VStack gap={2}>
          <Heading level={2}>{t(c.nextStep)}</Heading>
          <Text type="supporting" color="secondary">{t(c.nextStepHint)}</Text>
        </VStack>
      ) : null}
    </VStack>
  );
}
