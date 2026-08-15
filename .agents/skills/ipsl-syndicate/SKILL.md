---
name: ipsl-syndicate
description: Send the intentplex publishing queue out to LinkedIn, X (Chinese and English) and Weibo, using the Claude in Chrome extension against the user's signed-in sessions. Load when the user says "ipsl-syndicate", "发一下队列", "把批准的内容发出去", "send the approved posts", or after approving channels in the intentplex admin. Do not load for writing or generating content — that happens in the admin at /admin/syndicate/<id>.
---

# ipsl-syndicate

Take what the author approved in the intentplex admin and actually post it.

## Why this skill exists at all

The website cannot do this. Posting needs the author's signed-in browser sessions,
which live on their laptop; the site runs in a container in Azure. So the site does
the writing, reviewing and approving, and stops. **The button marked 发送 sets a row
to `approved` and nothing else happens until this skill runs.**

The transport is the one `ips-linkedin` proved: the **Claude in Chrome extension**
against the already-signed-in session, replaying the site's own internal endpoints
from inside the page. No official APIs, no app review, no tokens to store.

## Preconditions

- `tabs_context_mcp` — if the Claude in Chrome extension is not connected, stop and
  ask the user to sign in to the extension side panel. **The in-app browser pane has
  no platform sessions**; it is the wrong browser for this.
- `.env` in the repo root with `DATABASE_URL`. Every command below is run from the
  repo root as `node --env-file=.env scripts/sender-queue.mjs …`.

## The one rule that matters

**Claim, then send, then record. Never send without claiming first.**

```
draft → approved → posting → posted
```

`claim` flips exactly one row to `posting` and hands it to you. It does that in a
single statement with `for update skip locked`, so a second run cannot take the same
row. If you post first and record afterwards, a crash in between leaves a row that
looks unsent — and the next run sends it again. A duplicate post cannot be taken
back; a stuck `posting` row is visible and a person can fix it.

If a send fails, `release <id>` puts it back to `approved`. If you are unsure whether
it went out, **leave it in `posting`** and tell the user. Guessing is how something
gets posted twice.

## Procedure

### 1. See what is waiting

```bash
node --env-file=.env scripts/sender-queue.mjs list
```

### 2. Claim one

```bash
node --env-file=.env scripts/sender-queue.mjs claim
```

Returns `{id, channel, body, slug, cover_path}` or `null` when the queue is empty.
`channel` is one of `linkedin`, `x-zh`, `x-en`, `weibo`.

When the post needs its picture, write the bytes out first:

```bash
node --env-file=.env scripts/sender-queue.mjs image /media/uploads/<hash>.webp > /tmp/cover.webp
```

### 3. Post it

Per channel, in `references/channels.md`. Read that file at the moment of posting —
these composers change, and a selector remembered from an earlier run is the one
that has gone stale.

Two shapes, and prefer the second when it is available:

- **Drive the composer.** Open the composer, fill it, attach the image, submit.
  Works everywhere; breaks whenever the page changes.
- **Replay the page's own publish call.** What `ips-linkedin` does for reading, in
  the other direction. Steadier, but the request shape has to be captured fresh —
  read `read_network_requests` on a real post rather than hardcoding.

**Never post anything the author did not approve.** The body in the claimed row is
the text. Do not improve it, translate it, or add hashtags: it was reviewed in that
exact form.

### 4. Record the result

```bash
node --env-file=.env scripts/sender-queue.mjs posted <id> <url-of-the-post>
```

The URL has to be the real permalink — it is what the admin shows as proof. If you
cannot get one, `release <id>` and report rather than inventing a URL.

### 5. Repeat until `claim` returns null

## Redlines

- **Never send a row you did not claim.**
- **Never write `posted` without a real remote URL.**
- **Never edit the approved body.**
- **Never post to an account other than the author's own** — check whose session the
  browser is in before the first send of a run.
