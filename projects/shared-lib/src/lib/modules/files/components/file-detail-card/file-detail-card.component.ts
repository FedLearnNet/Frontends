import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {Store} from "@ngrx/store";
import {DomSanitizer} from "@angular/platform-browser";
import {
  selectErrorByFileId,
  selectFileContentById,
  selectLoadedByFileId,
  selectLoadingByFileId
} from "@shared-lib/modules/files/store/file.selectors";
import {getFileContent} from "@shared-lib/modules/files/store/file.actions";
import {ToolConfigDataType} from "@shared-lib/modules/app-execution/dto/config";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {FileContentComponent} from "@shared-lib/modules/files/components/file-content/file-content.component";

@Component({
  selector: 'lib-file-detail-card',
  imports: [
    SkeletonLoaderComponent,
    ErrorCardComponent,
    MatButton,
    MatIcon,
    MatTooltip,
    FileContentComponent
  ],
  templateUrl: './file-detail-card.component.html',
  styleUrl: './file-detail-card.component.scss'
})
export class FileDetailCardComponent {
  private readonly store = inject(Store);
  private readonly sanitizer = inject(DomSanitizer);

  file = input.required<FileDTO>();
  autoReloadOnError = input<number | undefined>(10);


  fileName = computed(() => this.file().fileName);
  fileContent = computed(() => {
    const file = this.file();
    if (!file) return undefined;
    return this.store.selectSignal(selectFileContentById(file.id))();
  });


  loaded = computed(() => this.store.selectSignal(selectLoadedByFileId(this.file().id))());
  loading = computed(() => this.store.selectSignal(selectLoadingByFileId(this.file().id))());
  error = computed(() => this.store.selectSignal(selectErrorByFileId(this.file().id))());

  private readonly retryDelayMs = 2000;
  private readonly retryAttempt = signal(0);
  readonly retryScheduled = signal(false);

  readonly autoReloadActive = computed(() => this.retryScheduled());

  // For file content display
  safeHtmlContent = computed(() => {
    const fileContent = this.fileContent();
    if (fileContent) {
      if (fileContent.type === ToolConfigDataType.HTML) {
        return this.sanitizer.bypassSecurityTrustHtml(fileContent.content);
      }
    }
    return undefined;
  });
  safeIframeUrl = computed(() => {
    const fileContent = this.fileContent();
    if (fileContent) {
      if (fileContent.type === ToolConfigDataType.HTML) {
        return this.sanitizer.bypassSecurityTrustResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(fileContent.content));
      }
    }
    return undefined;
  });

  dispatchFileLoading = effect(() => {
    this.reload();
  });

  private readonly resetRetryOnSuccess = effect(() => {
    const loaded = this.loaded();
    const err = this.error();
    if (loaded && !err) {
      this.retryAttempt.set(0);
      this.retryScheduled.set(false);
    }
  });

  private readonly autoRetryOnError = effect(() => {
    const err = this.error();
    const maxRetries = this.autoReloadOnError() ?? 0;

    if (!err || maxRetries <= 0) {
      return;
    }

    if (this.retryScheduled()) {
      return;
    }

    if (this.retryAttempt() >= maxRetries) {
      return;
    }

    this.retryScheduled.set(true);

    window.setTimeout(() => {
      this.retryAttempt.update(v => v + 1);
      this.reload();
      this.retryScheduled.set(false);
    }, this.retryDelayMs);
  });


  protected readonly FederatedAppConfigDataType = ToolConfigDataType;

  protected reload() {
    const file = this.file();
    this.retryScheduled.set(false);
    this.store.dispatch(getFileContent({secret: file.secret, id: file.id}));
  }
}
