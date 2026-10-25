/** Exact production origins; only equivalent loopback hosts in local development. */
export function isAllowedOrigin(origin: string | undefined, configured: string | undefined, production: boolean): boolean {
  if (!origin || origin === 'null') return false;
  const expected = configured || (production ? undefined : 'http://localhost:5173');
  if (!expected) return false;
  try {
    const actual = new URL(origin), allowed = new URL(expected);
    // Origin headers must contain only the origin, without credentials, paths or query strings.
    if (actual.origin !== origin || allowed.origin !== expected) return false;
    if (actual.origin === allowed.origin) return true;
    const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
    return !production && loopback.has(actual.hostname) && loopback.has(allowed.hostname)
      && actual.protocol === allowed.protocol && actual.port === allowed.port;
  } catch { return false; }
}
