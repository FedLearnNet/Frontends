import {Component, computed, input} from '@angular/core';
import {MatProgressBar, ProgressBarMode} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {UploadProgress} from '@shared-lib/modules/files/model/file-response';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';

const BYTES_PER_MB = 1024 * 1024;

@Component({
  selector: 'lib-upload-progress',
  imports: [MatProgressBar, MatIcon, ErrorCardComponent],
  templateUrl: './upload-progress.component.html',
  styleUrl: './upload-progress.component.scss',
})
export class UploadProgressComponent {
  public progress = input.required<UploadProgress>();
  public showLabel = input<boolean>(true);

  readonly hasError = computed(() => this.progress().error != null);
  readonly errorObject = computed(() => {
    const err = this.progress().error;
    return (err ?? null) as string | object | null;
  });
  readonly hasBytes = computed(() => {
    const p = this.progress();
    return (p.total ?? 0) > 0;
  });
  readonly finished = computed(() => {
    const p = this.progress();
    return !p.inProgress && p.error == null && p.progress >= 100;
  });
  readonly mode = computed<ProgressBarMode>(() =>
    this.progress().inProgress && this.progress().progress === 0 && !this.hasBytes()
      ? 'indeterminate'
      : 'determinate'
  );
  readonly percent = computed(() => Math.round(this.progress().progress ?? 0));
  readonly loadedMb = computed(() => this.formatMb(this.progress().loaded ?? 0));
  readonly totalMb = computed(() => this.formatMb(this.progress().total ?? 0));

  private formatMb(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '0.0';
    }
    return (bytes / BYTES_PER_MB).toFixed(1);
  }
}
