import {Component, computed, DestroyRef, inject, input, signal} from '@angular/core';
import {interval} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BadgeColor, BadgeComponent, BadgeSize} from "@shared-lib/components/badge/badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {DatePipe} from "@angular/common";

export type DateFormat = 'LONG' | 'SHORT' | 'MEDIUM' | 'DATE';

@Component({
  selector: 'lib-time-badge',
  imports: [
    BadgeComponent,
    StatusBadgeComponent
  ],
  providers: [DatePipe],
  templateUrl: './time-badge.component.html',
  styleUrl: './time-badge.component.scss'
})
export class TimeBadgeComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly datePipe: DatePipe = inject(DatePipe);

  date = input.required<Date | undefined | null>();
  dateTo = input<Date | undefined | null>();
  calcDuration = input<boolean>(false);
  calcDurationInMs = input<boolean>(false);
  color = input<BadgeColor>('GREEN');
  size = input<BadgeSize>('SMALL');
  format = input<DateFormat>('MEDIUM');

  private now = signal(Date.now());
  duration = computed(() => {
    const startedAt = this.date();
    const finishedAt = this.dateTo();

    if (!startedAt) {
      return 'N/A';
    }

    try {
      const startTime = new Date(startedAt).getTime();
      if (isNaN(startTime)) {
        return 'N/A';
      }

      if (finishedAt) {
        const finishTime = new Date(finishedAt).getTime();
        if (isNaN(finishTime)) {
          return this.formatDurationValue(this.now() - startTime);
        }
        return this.formatDurationValue(finishTime - startTime);
      }

      return this.formatDurationValue(this.now() - startTime);

    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Error';
    }
  });

  computedDateString = computed(() => {
    const d = this.date();
    const f = this.format();

    if (!d) {
      return 'N/A';
    }

    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      const angularFormat = f === 'DATE' ? 'mediumDate' : f.toLowerCase();
      return this.datePipe.transform(dateObj, angularFormat) ?? 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  });

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.now.set(Date.now());
      });
  }

  private formatDurationValue(ms: number): string {
    if (this.calcDurationInMs()) {
      return `${Math.max(ms, 0)}ms`;
    }

    return this.formatDuration(ms);
  }

  private formatDuration(ms: number): string {
    if (ms < 0) ms = 0;

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const s = seconds % 60;
    const m = minutes % 60;
    const h = hours;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);

    if (s > 0 || parts.length === 0) {
      parts.push(`${s}s`);
    }

    return parts.join(' ');
  }

}
