import {createServerFn} from '@tanstack/react-start';

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
/**
 * The session check, called first in every handler below.
 *
 * It was a `createMiddleware({type: 'function'})` at first, which is the tidier
 * shape — but a middleware that returns `next()` swallowed the handler's return
 * value during SSR, and the page rendered against `undefined` instead of
 * failing. A helper called explicitly is duller and does not do that.
 */
async function assertAdmin(): Promise<void> {
  const [{getRequest}, {isSignedIn}] = await Promise.all([
    import('@tanstack/react-start/server'),
    import('~/server/auth'),
  ]);
  if (!isSignedIn(getRequest())) throw new Error('not signed in');
}

// Written out in full at every call site, never behind a factory. The Start
// plugin finds server functions by matching `createServerFn(...).handler(...)`
// as one literal chain; wrapping the head in `const adminFn = () => …` broke
// that match, and the functions silently became no-ops returning `undefined` —
// the page rendered against nothing rather than failing.

export const adminList = createServerFn({method: 'POST'}).handler(async () => {
    await assertAdmin();
  const {listAllEntries} = await import('~/server/admin');
  return listAllEntries();
});

export const adminGetEntry = createServerFn({method: 'POST'})
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}): Promise<EditableEntry> => {
    const {getEntryForEdit} = await import('~/server/admin');
    return getEntryForEdit(data.entryId);
  });

export const adminSave = createServerFn({method: 'POST'})
  .validator((input: unknown): EntryDraft => input as EntryDraft)
  .handler(async ({data}) => {
    await assertAdmin();
    const {saveEntry} = await import('~/server/admin');
    return {id: await saveEntry(data)};
  });

export const adminUpload = createServerFn({method: 'POST'})
  .validator((input: unknown): {name: string; base64: string} => {
    const {name, base64} = input as {name?: unknown; base64?: unknown};
    if (typeof name !== 'string' || typeof base64 !== 'string') {
      throw new Error('upload needs {name, base64}');
    }
    return {name, base64};
  })
  .handler(async ({data}) => {
    await assertAdmin();
    const {uploadImage} = await import('~/server/admin');
    return {path: await uploadImage(Buffer.from(data.base64, 'base64'), data.name)};
  });

export const adminGenerate = createServerFn({method: 'POST'})
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}) => {
    await assertAdmin();
    const {generateAll} = await import('~/server/generate');
    return generateAll(data.entryId);
  });

export const adminGenerateCover = createServerFn({method: 'POST'})
  .validator((input: unknown): {prompt: string} => {
    const {prompt} = input as {prompt?: unknown};
    if (typeof prompt !== 'string' || prompt.trim() === '') throw new Error('cover needs a prompt');
    return {prompt};
  })
  .handler(async ({data}) => {
    await assertAdmin();
    const [{generateCover}, {uploadImage}] = await Promise.all([
      import('~/server/generate'),
      import('~/server/admin'),
    ]);
    const bytes = await generateCover(data.prompt);
    // Through the same pipeline an upload takes: resized, webp, thumbnailed,
    // content-hashed. One way in.
    return {path: await uploadImage(bytes, 'cover.png')};
  });

export const adminSaveRendition = createServerFn({method: 'POST'})
  .validator(
    (input: unknown): {entryId: string; lang: 'en' | 'zh'; title: string; body: string} =>
      input as {entryId: string; lang: 'en' | 'zh'; title: string; body: string},
  )
  .handler(async ({data}) => {
    await assertAdmin();
    const {saveGenerated} = await import('~/server/admin');
    await saveGenerated(data.entryId, data.lang, data.title, data.body);
    return {ok: true as const};
  });

export const adminPending = createServerFn({method: 'POST'}).handler(async () => {
  await assertAdmin();
  const {pendingWork} = await import('~/server/syndication');
  return pendingWork();
});

export const adminSyndications = createServerFn({method: 'POST'})
  .validator((input: unknown): {entryId: string} => input as {entryId: string})
  .handler(async ({data}) => {
    await assertAdmin();
    const {forEntry} = await import('~/server/syndication');
    return forEntry(data.entryId);
  });

export const adminSaveSyndication = createServerFn({method: 'POST'})
  .validator(
    (input: unknown): {entryId: string; channel: string; body: string} =>
      input as {entryId: string; channel: string; body: string},
  )
  .handler(async ({data}) => {
    await assertAdmin();
    const {saveBody} = await import('~/server/syndication');
    await saveBody(data.entryId, data.channel, data.body);
    return {ok: true as const};
  });

export const adminSetChannelStatus = createServerFn({method: 'POST'})
  .validator(
    (input: unknown): {entryId: string; channel: string; status: string} =>
      input as {entryId: string; channel: string; status: string},
  )
  .handler(async ({data}) => {
    await assertAdmin();
    const {setStatus} = await import('~/server/syndication');
    await setStatus(data.entryId, data.channel, data.status);
    return {ok: true as const};
  });
