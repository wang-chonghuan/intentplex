# The four composers

Read this at the moment of posting. Selectors and endpoint shapes change between
builds of these sites — a value remembered from an earlier run is the one that has
gone stale. Where a hash or an id is named below, treat it as an example of the
*shape*, never as something to paste.

## LinkedIn

The session and the internal API are already understood: `ips-linkedin` reads the
same account through **Voyager**, and the notes in its `references/dead-ends.md`
apply here too — above all that the rendered feed is virtualized and is the wrong
surface to work against.

**Composer route.** `https://www.linkedin.com/feed/` → the "Start a post" button
opens a modal. The editor is a `contenteditable`, not a `<textarea>`: setting
`.value` does nothing and setting `.textContent` leaves React's state empty. Type
into it, or dispatch a real `input` event after inserting.

**Image.** The modal's photo button opens a file input. Write the bytes to a temp
file first (`sender-queue.mjs image <path> > /tmp/cover.webp`) and use `file_upload`.

**Verifying.** After submitting, the new post appears at the top of the author's
activity feed. Its permalink is `https://www.linkedin.com/feed/update/<activity urn>`.
Read it from the DOM rather than constructing it.

**Length.** 3000 characters. The first ~200 are what shows before "see more" — the
body was written for that and must not be reflowed.

## X — two accounts

`ips-xhistory` already establishes that the user's X session is reachable from the
extension.

**Which account.** `x-zh` and `x-en` are *different accounts*. Before the first send
of a run, check which one the browser is signed in as (the account switcher, or
`https://x.com/settings/account`). Sending Chinese copy to the English account is
not recoverable. If the session is the wrong one, stop and ask — do not sign in and
out on the user's behalf.

**Composer.** `https://x.com/compose/post`. Also a `contenteditable` (Draft.js).

**Threads.** An `x-en` body may contain several posts separated by a blank line.
Post the first, then reply to it with each subsequent one, so they chain. A thread
posted as separate top-level posts is not a thread.

**Permalink.** `https://x.com/<handle>/status/<id>` — read it after posting.

## Weibo

**Composer.** `https://weibo.com/` — the box at the top of the home timeline.

**The image is close to mandatory.** A text-only 微博 gets very little reach. If the
entry has a cover, attach it; if it does not, say so rather than posting bare.

**Topics.** `#话题#` needs the closing `#` to register as a topic — `#话题` alone is
plain text. The generated body already has them; do not add more.

**Length.** 2000 characters for a normal account. Past that the composer switches to
long-form, which is a different object with a different permalink — if the body is
over the limit, stop rather than letting it become an article.

## What to do when a composer has changed

Do not improvise a new selector and push through. Capture what the page actually
does — `read_network_requests` while making one post by hand — and write the finding
into this file. The cost of a wrong guess here is a post under the author's name,
which cannot be un-published.
