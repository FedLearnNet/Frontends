import {Component, DestroyRef, OnInit, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormControl} from '@angular/forms';
import {catchError, finalize, of} from 'rxjs';
import {MatProgressBar} from '@angular/material/progress-bar';
import {DragAndDropFileComponent} from '@shared-lib/components/drag-and-drop-file/drag-and-drop-file.component';
import {FileCardComponent} from '@shared-lib/modules/files/components/file-card/file-card.component';
import {FileDTO} from '@shared-lib/modules/files/dto/file';
import {ConnectorFilesDTO} from '../../dto/upload-info';
import {ConnectorUploadService} from '../../services/connector-upload.service';
import {ALLOWED_FILE_EXTENSIONS} from '../../constansts/allowed-file-extenstion.constants';
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import { TranslatePipe } from '@ngx-translate/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ImportActions} from '../../store/import/import.actions';
import {selectCohortImports} from '../../store/import/import.selectors';
import {
  ImportActivityChipComponent
} from '../import/import-activity-chip/import-activity-chip.component';

@Component({
  selector: 'app-connector-file-list',
  templateUrl: './connector-file-list.component.html',
  styleUrl: './connector-file-list.component.scss',
  imports: [
    RouterLink,
    MatProgressBar,
    DragAndDropFileComponent,
    FileCardComponent,
    PageWrapperComponent,
    HeaderComponent,
    EmptyStateComponent,
    BtnComponent,
    SseRefreshBtnComponent,
    TranslatePipe,
    ImportActivityChipComponent
  ]
})
export class ConnectorFileListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly uploadService = inject(ConnectorUploadService);
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  readonly cohortId = Number(this.route.snapshot.paramMap.get('cohortId'));
  readonly files = signal<ConnectorFilesDTO[]>(this.route.snapshot.data['files'] ?? []);
  readonly loading = signal(false);
  readonly uploadInProgress = signal(false);
  readonly error = signal<any | null>(null);
  readonly showUpload = signal(false);
  readonly fileControl = new FormControl<File[]>([], {nonNullable: true});
  readonly accept = ALLOWED_FILE_EXTENSIONS.join(',');

  readonly sortedFiles = computed(() => [...this.files()].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }));

  readonly ongoingImports = this.store.selectSignal(selectCohortImports(this.cohortId));

  ngOnInit(): void {
    // Imports this browser did not start - another tab, or the page before a reload - belong on the
    // overview too: it is the page that answers what this cohort has.
    this.store.dispatch(ImportActions.loadCohortImports({cohortId: this.cohortId}));
    this.actions.pipe(ofType(ImportActions.importFinished), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refresh());
  }

  toggleUpload(): void {
    this.showUpload.update(value => !value);
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    this.uploadService.getFiles(this.cohortId).pipe(
      finalize(() => this.loading.set(false)),
      catchError((error) => {
        this.error.set(error);
        return of([]);
      })
    ).subscribe(files => this.files.set(files));
  }

  onFilesChanged(files: File[]): void {
    const file = files.at(-1);
    if (!file) {
      return;
    }

    this.uploadInProgress.set(true);
    this.error.set(null);

    this.uploadService.uploadFile(this.cohortId, file).pipe(
      finalize(() => {
        this.uploadInProgress.set(false);
        this.fileControl.setValue([]);
      }),
      catchError((error) => {
        this.error.set(error);
        return of(undefined);
      })
    ).subscribe(uploadedFile => {
      if (!uploadedFile) {
        return;
      }

      this.files.update(current => {
        const withoutCurrent = current.filter(existing => existing.id !== uploadedFile.id);
        return [uploadedFile, ...withoutCurrent];
      });
      this.showUpload.set(false);
    });
  }

  asFile(file: ConnectorFilesDTO): FileDTO {
    return {
      ...file,
      keycloakId: '',
      secret: file.secret ?? '',
    };
  }
}
