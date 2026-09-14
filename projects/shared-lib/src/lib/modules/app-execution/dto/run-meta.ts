/**
 * Metric keys used inside {@link RunMeta.timings}. Mirrors the backend `RunTimingMetric` enum.
 * RUNTIME is always present when measured; the OVERHEAD_* keys only appear when the backend flag
 * `posymed.runtime.overhead.enabled` is on.
 */
export enum RunTimingMetric {
  RUNTIME = 'RUNTIME',
  OVERHEAD_STARTUP = 'OVERHEAD_STARTUP',
  OVERHEAD_TEARDOWN = 'OVERHEAD_TEARDOWN',
  OVERHEAD_TOTAL = 'OVERHEAD_TOTAL',
}

/**
 * Free-form run metadata (stored as JSON on the backend). Extensible: new keys can be added
 * without breaking older clients. Everything is optional/nullable.
 */
export interface RunMeta {
  /** metric -> milliseconds */
  timings?: { [metric: string]: number } | null;

  // reserved for follow-up (not populated yet) — see backend RunMetaDTO
  engineVersion?: string | null;
  peakMemoryMb?: number | null;
  avgCpuPercent?: number | null;
}
