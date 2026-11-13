import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {QueryService} from "@global-app/find-data/services/query.service";
import {DataTypeSubscriptionDTO} from "@global-app/schema/dto/datatype";
import {ProjectDto} from "@global-app/project/dto/project";
import {TranslatePipe} from "@ngx-translate/core";
import {QueryDTO} from "@global-app/find-data/dto/query";
import {isLang2Group} from "@global-app/find-data/dto/lang2-query";
import {collectOntologyIds} from "@global-app/find-data/helpers/query-tree.serializer";
import {MatTabsModule} from "@angular/material/tabs";
import {
  ProjectExperimentDataComponent
} from "@global-app/project/components/detail-project/components/project-experiment-data/project-experiment-data.component";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {UnsavedChangesService} from "@shared-lib/services/unsaved-changes.service";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {
  DatasetPreviewCardComponent
} from "@global-app/project/components/dataset-preview-card/dataset-preview-card.component";
import {
  DatasetBuilderPageComponent
} from "@global-app/project/components/dataset-builder-page/dataset-builder-page.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";


@Component({
  selector: 'app-create-datasets',
  templateUrl: './create-datasets.component.html',
  styleUrl: './create-datasets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    MatTabsModule,
    ProjectExperimentDataComponent,
    DatasetBuilderPageComponent,
    DatasetPreviewCardComponent,
    MatButtonModule,
    MatIconModule,
    PageWrapperComponent,
    EmptyStateComponent
  ]
})
export class CreateDatasetsComponent {
  private readonly unsavedChanges: UnsavedChangesService = inject(UnsavedChangesService);
  private readonly dataTypeService: DataTypeService = inject(DataTypeService);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  readonly project = input.required<ProjectDto>();

  protected readonly builderOpen = signal<boolean>(false);
  protected readonly query = signal<QueryDTO | undefined>(undefined);
  protected readonly dataTypes = signal<DataTypeSubscriptionDTO[]>([]);
  protected readonly loaded = signal<boolean>(false);
  protected readonly exportConfig = signal<PatientDataExportConfigDTO>({} as PatientDataExportConfigDTO);
  protected readonly queryError = signal<string | undefined>(undefined);
  protected readonly dataTypeError = signal<string | undefined>(undefined);

  protected readonly hasQuery = computed(() => this.project()?.queryId !== undefined);

  private projectEffect$ = effect(() => {
    this.exportConfig.set(this.project().exportConfig ?? {} as PatientDataExportConfigDTO);
  });

  private queryEffect$ = effect(() => {
    if (!this.project().queryId) {
      return;
    }

    this.queryError.set(undefined);
    this.queryService.get(this.project().queryId!).subscribe({
      next: query => {
        this.query.set(query);
      },
      error: err => {
        this.queryError.set(this.errorSnackbarService.getErrorMessage(err));
      }
    });
  });

  private dataTypeEffect$ = effect(() => {
    if (!this.query()) {
      return;
    }
    const storedQuery = this.query()!.query;
    const ontologyIds = isLang2Group(storedQuery) ? collectOntologyIds(storedQuery) : [];
    this.dataTypeError.set(undefined);
    this.dataTypeService.getAllForQuery(ontologyIds).subscribe({
      next: dataTypes => {
        this.dataTypes.set(dataTypes);
        this.loaded.set(true);
      },
      error: err => {
        this.loaded.set(true);
        this.dataTypeError.set(this.errorSnackbarService.getErrorMessage(err));
      }
    });
  });

  openDatasetBuilder(): void {
    if (!this.project()?.id) {
      return;
    }
    this.builderOpen.set(true);
  }

  closeDatasetBuilder(): void {
    this.unsavedChanges.confirmLeave().subscribe(canLeave => {
      if (canLeave) {
        this.builderOpen.set(false);
      }
    });
  }
}
