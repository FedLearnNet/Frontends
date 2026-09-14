import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {formatDuration, overheadPercent} from '@shared-lib/utils/duration.helper';
import {RunMeta, RunTimingMetric} from '@shared-lib/modules/app-execution/dto/run-meta';

/**
 * Compact performance panel for a single tool run, driven by the run's {@link RunMeta}.
 *
 * Runtime (pure scientific compute time) is always shown. The overhead breakdown (startup,
 * teardown, total, wall-clock total and overhead %) is rendered only when the backend supplied the
 * overhead timings — i.e. when posymed.runtime.overhead.enabled is true. When they are absent
 * nothing extra is shown (no empty placeholders). Missing values render as "—".
 */
@Component({
  selector: 'lib-run-performance',
  imports: [],
  templateUrl: './run-performance.component.html',
  styleUrl: './run-performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunPerformanceComponent {
  meta = input<RunMeta | null>();

  private readonly timing = (metric: RunTimingMetric): number | null | undefined =>
    this.meta()?.timings?.[metric];

  private readonly runtimeMs = computed(() => this.timing(RunTimingMetric.RUNTIME));
  private readonly overheadTotalMs = computed(() => this.timing(RunTimingMetric.OVERHEAD_TOTAL));

  // Overhead is only displayable when the backend actually returned the breakdown.
  readonly hasOverhead = computed(() =>
    this.overheadTotalMs() !== null && this.overheadTotalMs() !== undefined,
  );

  readonly runtimeLabel = computed(() => formatDuration(this.runtimeMs()));
  readonly startupLabel = computed(() => formatDuration(this.timing(RunTimingMetric.OVERHEAD_STARTUP)));
  readonly teardownLabel = computed(() => formatDuration(this.timing(RunTimingMetric.OVERHEAD_TEARDOWN)));
  readonly totalOverheadLabel = computed(() => formatDuration(this.overheadTotalMs()));

  readonly wallTotalLabel = computed(() => {
    const runtime = this.runtimeMs();
    const overhead = this.overheadTotalMs();
    if (runtime === null || runtime === undefined || overhead === null || overhead === undefined) {
      return '—';
    }
    return formatDuration(runtime + overhead);
  });

  readonly overheadPercentLabel = computed(() => {
    const pct = overheadPercent(this.overheadTotalMs(), this.runtimeMs());
    return pct === null ? '—' : `${pct} %`;
  });
}
