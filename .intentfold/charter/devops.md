# DevOps — deployment and operations

Human-authored. How **this** project is deployed and operated.
Section shape is fixed — see `readme.md`.

Most tickets end at merge. A ticket the human filed as **`Finish: auto-deploy`** runs the deploy leg
below right after merging, so this file has to be executable as written — an agent will follow it
without asking. Read the commands at the moment of deploying and run them as written; a deploy
command recalled from earlier in the run is the one that is out of date.

*Seeded at init from the human's answer that this project targets Azure Container Apps via n-easyapp.
**Nothing has been deployed yet** — the app does not exist. The commands below are the intended shape,
not commands anyone has run against this project; the first deploy needs the human and will replace
the angle-bracketed values with real ones.*

## Contract

**Environments**

Production only. No staging, no preview environment.

- **Production** — <https://intentplex.com> (apex, Cloudflare DNS-only → Azure managed cert).
  `www` 301s to it. The container's own hostname is
  `ca-intentplex.kindsmoke-4d84c417.northeurope.azurecontainerapps.io`.

**Where it runs**

Azure Container Apps on the **n-easyapp** substrate, in the shared environment
`cae-easyapp-shared` — the same substrate as lemmadeck. The deployed thing is one container running
the TanStack Start SSR server built by `npm run build`; there is no separate static host, no database
and no worker.

n-easyapp is used here because the human named it. The easyapp project name is **`intentplex`**, and
it is recorded in `.intentfold/project.json` under `deploy`.

The app exists and is serving. Routine redeploys are the normal case; the first-deploy redline
below tests for a missing revision rather than assuming one.

## Tools

**Deploy**

*First deploy* — creates the container app. **Needs the human** (`## Redlines` 1 and 2); it is not a
command an agent runs on its own:

```bash
# via the n-easyapp skill, create capability, project intentplex, template tanstack-start
```

*Routine redeploy* — the normal one, once the app exists:

```bash
# via the n-easyapp skill, redeploy capability, project intentplex
```

**Post-deploy check**

A healthy response is HTTP 200 whose body carries the server-rendered page, not just the shell — this
site server-renders, so a nearly-empty body means the SSR handler failed even though the container is
up. **The container app also reports `Succeeded` while the previous revision is still taking all the
traffic**, so run this until it agrees, not once.

Targets are **derived from the deployed app**, never listed here (`readme.md`, test 4): the routes
belong to the product and change under tickets that never open this file.

```bash
URL=https://intentplex.com
body=$(mktemp)

routes=$(curl -sf "$URL/" \
  | grep -aoE 'href="/[^"#?]*"' | sed 's/href="//; s/"$//' \
  | grep -vE '\.[a-z0-9]+$' | sort -u)

if [ -z "$routes" ]; then
  echo "FAIL: derived 0 routes from $URL/ — no answer, or a page with no internal links"
  exit 1
fi

pages=0
fail=0
while read -r p; do
  code=$(curl -s -o "$body" -w '%{http_code}' "$URL$p")
  bytes=$(wc -c < "$body" | tr -d ' ')
  case "$code" in
    3??) printf '%s  %-48s %s\n' "$code" "$p" "(redirect — not a content page)" ;;
    200) printf '%s  %-48s %8s bytes\n' "$code" "$p" "$bytes"
         pages=$((pages + 1))
         [ "$bytes" -gt 10000 ] || fail=1 ;;
    *)   printf '%s  %-48s %8s bytes\n' "$code" "$p" "$bytes"; fail=1 ;;
  esac
done <<ROUTES
$routes
ROUTES

rm -f "$body"
[ "$pages" -gt 0 ] || { echo "FAIL: nothing answered with a page"; exit 1; }
[ "$fail" -eq 0 ] || { echo "FAIL: a route is missing, erroring, or served without SSR content"; exit 1; }
printf 'OK: %s pages, all 200 with SSR content\n' "$pages"
```

Read it as three separate assertions, because each one fails in a way the others cannot see:

- **`grep -a` is load-bearing, not a flag someone left on.** The home page is one long line of UTF-8
  — Chinese, em dashes — and BSD `grep` in a non-UTF-8 locale classifies that as binary, then reports
  **no matches at all** rather than saying so. Without `-a` this check derives nothing on the very
  machine most likely to run it.
- **An empty derivation is a hard failure.** Deriving targets removes the stale-list failure and
  replaces it with a quieter one: derive zero, iterate zero times, exit 0. That reads as a clean bill
  of health for a site that is entirely down. A derived check must prove it derived something.
- **A redirect is not a failure, and not a page either.** Some links on the site are doors rather
  than pages — they answer 3xx by design, and following one lands somewhere that is not ours to
  judge. They are printed and skipped. What replaces them as the guard is `pages`: at least one route
  has to come back as a real page, so a site that started redirecting *everything* still fails even
  though the derivation succeeded. Naming which paths redirect would put product facts back in this
  file, which is the thing it is not allowed to hold.
- **`grep -v` drops anything with a file extension.** `/assets/*.js` and `/media/*.jpg` come from the
  same origin and answer 200 whatever the app is doing, so leaving them in makes the check pass on a
  site whose pages are all broken.

The 10 kB floor is what separates a server-rendered page from a bare shell: this site SSRs, so a
container that is up with a broken handler still answers 200 with a body an order of magnitude too
small. The exit status is the result — `OK:` on success, non-zero and a reason otherwise.

Confirm the revision actually took over:

```bash
az containerapp revision list -g rg-easyapp-shared -n ca-intentplex \
  --query "[].{name:name,health:properties.healthState,traffic:properties.trafficWeight}" -o tsv
```

The revision carrying 100% traffic must be the newest one and `Healthy`.

**Secrets and configuration**

None. The app reads no secrets and calls no external service at runtime. If that ever changes,
runtime configuration goes in the container app's environment variables through n-easyapp, never in
the image and never in the repo.

**Operations**

Logs, restarts and scaling are the container app's own, through n-easyapp or the Azure CLI. There are
no cron jobs and no scheduled work. Rollback is a redeploy of the previous revision.

## Guidance

The build is the deployable artifact, so a deploy that fails at build time is a code problem and
belongs back in a ticket, not in a retry. A deploy that builds and then serves a broken page is the
case the post-deploy check exists for — read the response body, not the exit code.

When the post-deploy check fails, roll back to the previous revision before investigating. A
half-working production site is worse than the previous one.

## Redlines

Deployment writes to external systems, so this is the section cap4 looks up before it deploys.

1. **Creating or deleting cloud resources** — not without the human's explicit approval.
2. **Deploying for the first time** — not without the human's explicit approval. Lookupable, and it
   is a test rather than a recorded state: `az containerapp revision list … --query "length(@)"`
   returns `0`, or the app does not exist. A routine redeploy of an existing revision is not this.
3. **A deploy that changes the runtime by more than the image's application code** — not without the
   human's explicit approval. The concrete shapes, so this is looked up and not judged: the service
   needs an environment variable it does not already have · the container's ingress, port, scaling or
   resource limits changed · the base image or Node major version changed · a custom domain or
   certificate is involved.
4. **Pointing a production domain at anything new** — not without the human's explicit approval.
5. **Reporting a deploy as done without running the post-deploy check** — forbidden outright.
