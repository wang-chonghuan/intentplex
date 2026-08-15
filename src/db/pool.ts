import '@tanstack/react-start/server-only';

import pg from 'pg';

/**
 * The one connection pool.
 *
 * Server-only by construction: the marker import above makes the import-protection
 * plugin fail the build if anything reachable from the client pulls this in. That
 * matters more here than usual — before this ticket the whole corpus was bundled
 * into the client, so the habit of importing content anywhere was already formed.
 *
 * `DATABASE_URL` is supplied by n-easyapp (schema `intentplex-schema` on the
 * shared `pg-easyapp-shared` server); see runbook.md for the local form.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. The site reads its content from Postgres — see runbook.md.',
  );
}

// The connection string already carries `options=-csearch_path="intentplex-schema"`,
// so unqualified table names resolve inside this project's schema. Setting it here
// too would be a second place to keep in sync; see arch.md on one way to do a thing.
export const pool = new pg.Pool({
  connectionString,
  // The shared server is a Burstable instance and every project on it draws from
  // the same connection budget. This site serves one process and its pages are
  // cached in memory, so a handful of connections is plenty.
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  values?: ReadonlyArray<unknown>,
): Promise<Array<T>> {
  const result = await pool.query<T>(text, values as Array<unknown>);
  return result.rows;
}
