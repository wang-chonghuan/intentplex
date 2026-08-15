import {createMiddleware, createServerFn} from '@tanstack/react-start';

import type {EditableEntry, EntryDraft} from '~/rpc/types';

/**
 * The admin's server functions.
 *
 * **Every server-only module here is imported inside a handler, not at the top
 * of the file.** The handlers are stripped from the client build, but a
 * top-level `import` is an edge in the module graph whether or not the code that
 * used it survives — and following that edge pulled `pg` and `sharp`, native
 * modules and all, into the browser bundle. Dynamic imports keep the edge inside
 * the part that only ever runs on the server. Types are imported normally;
 * `import type` disappears at compile time.
 *
 * `start.ts` gates `/admin`, but a server function is its own URL and is not
 * under that path, so the gate in front of the pages does nothing for it. The
 * check lives in one middleware every function here is built on, rather than
 * being repeated — and one day forgotten — in each handler.
 */
const adminOnly = createMiddleware({type: 'function'}).server(async ({next}) => {
  const [{getRequest}, {isSignedIn}] = await Promise.all([
    import('@tanstack/react-start/server'),
    import('~/server/auth'),
  ]);
  if (!isSignedIn(getRequest())) throw new Error('not signed in');
  return next();
});

const adminFn = () => createServerFn({method: 'POST'}).middleware([adminOnly]);

export const adminList = adminFn().handler(async () => {
  const {listAllEntries} = await import('~/server/admin');
  return listAllEntries();
});

export const adminGetEntry = adminFn()
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}): Promise<EditableEntry> => {
    const {getEntryForEdit} = await import('~/server/admin');
    return getEntryForEdit(data.entryId);
  });

export const adminSave = adminFn()
  .validator((input: unknown): EntryDraft => input as EntryDraft)
  .handler(async ({data}) => {
    const {saveEntry} = await import('~/server/admin');
    return {id: await saveEntry(data)};
  });

export const adminUpload = adminFn()
  .validator((input: unknown): {name: string; base64: string} => {
    const {name, base64} = input as {name?: unknown; base64?: unknown};
    if (typeof name !== 'string' || typeof base64 !== 'string') {
      throw new Error('upload needs {name, base64}');
    }
    return {name, base64};
  })
  .handler(async ({data}) => {
    const {uploadImage} = await import('~/server/admin');
    return {path: await uploadImage(Buffer.from(data.base64, 'base64'), data.name)};
  });

export const adminGenerate = adminFn()
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}) => {
    const {generateAll} = await import('~/server/generate');
    return generateAll(data.entryId);
  });

export const adminSaveRendition = adminFn()
  .validator(
    (input: unknown): {entryId: string; lang: 'en' | 'zh'; title: string; body: string} =>
      input as {entryId: string; lang: 'en' | 'zh'; title: string; body: string},
  )
  .handler(async ({data}) => {
    const {saveGenerated} = await import('~/server/admin');
    await saveGenerated(data.entryId, data.lang, data.title, data.body);
    return {ok: true as const};
  });

export const adminSyndications = adminFn()
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}) => {
    const {forEntry} = await import('~/server/syndication');
    return forEntry(data.entryId);
  });

export const adminSaveSyndication = adminFn()
  .validator(
    (input: unknown): {entryId: string; channel: string; body: string} =>
      input as {entryId: string; channel: string; body: string},
  )
  .handler(async ({data}) => {
    const {saveBody} = await import('~/server/syndication');
    await saveBody(data.entryId, data.channel, data.body);
    return {ok: true as const};
  });

export const adminSetChannelStatus = adminFn()
  .validator(
    (input: unknown): {entryId: string; channel: string; status: string} =>
      input as {entryId: string; channel: string; status: string},
  )
  .handler(async ({data}) => {
    const {setStatus} = await import('~/server/syndication');
    await setStatus(data.entryId, data.channel, data.status);
    return {ok: true as const};
  });
