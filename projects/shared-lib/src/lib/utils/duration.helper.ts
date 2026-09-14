/**
 * Formats a duration given in milliseconds into a compact, human-readable string.
 *
 * Examples: 850 → "850 ms", 1234 → "1.23 s", 95_000 → "1 min 35 s".
 * Returns "—" for null/undefined/negative values so callers can render missing timings uniformly.
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms) || ms < 0) {
    return '—';
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    // Keep two significant decimals for sub-minute durations without trailing zeros.
    return `${parseFloat(seconds.toFixed(2))} s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds - minutes * 60);
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds} s`;
}

/**
 * Overhead as a percentage of the wall-clock total (runtime + overhead), rounded to one decimal.
 * Returns null when the inputs are missing or the wall total is zero.
 */
export function overheadPercent(
  overheadTotalMs: number | null | undefined,
  runtimeMs: number | null | undefined,
): number | null {
  if (
    overheadTotalMs === null || overheadTotalMs === undefined ||
    runtimeMs === null || runtimeMs === undefined
  ) {
    return null;
  }
  const wallTotal = runtimeMs + overheadTotalMs;
  if (wallTotal <= 0) {
    return null;
  }
  return Math.round((overheadTotalMs / wallTotal) * 1000) / 10;
}
