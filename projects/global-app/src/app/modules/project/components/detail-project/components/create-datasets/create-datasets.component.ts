import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {QueryService} from "@global-app/find-data/services/query.service";
import {DataTypeSubscriptionDTO} from "@global-app/schema/dto/datatype";
import {ProjectDto} from "@global-app/project/dto/project";
import {TranslatePipe} from "@ngx-translate/core";
import {QueryDTO} from "@global-app/find-data/dto/query";
import {MatTabsModule} from "@angular/material/tabs";
import {
  ProjectExperimentDataComponent
} from "@global-app/project/components/detail-project/components/project-experiment-data/project-experiment-data.component";
import {Store} from "@ngrx/store";
import {ProjectActions} from "@global-app/project/store/project.actions";
import {Router} from "@angular/router";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {hasExportSelections} from "@shared-lib/modules/data-modeler/utils/patient-export-config.util";
import {
  DatasetPreviewCardComponent
} from "@global-app/project/components/dataset-preview-card/dataset-preview-card.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {selectError} from "@global-app/project/store/project.selectors";
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
    DatasetPreviewCardComponent,
    PageWrapperComponent,
    EmptyStateComponent
  ]
})
export class CreateDatasetsComponent {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);
  private readonly dataTypeService: DataTypeService = inject(DataTypeService);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  project = input.required<ProjectDto>();
  query = signal<QueryDTO | undefined>(undefined);
  dataTypes = signal<DataTypeSubscriptionDTO[]>([]);
  loaded = signal<boolean>(false);
  showSetting = signal<boolean>(false);
  exportConfig = signal<PatientDataExportConfigDTO>({} as PatientDataExportConfigDTO);

  projectError = this.store.selectSignal(selectError);
  queryError = signal<string | undefined>(undefined);
  dataTypeError = signal<string | undefined>(undefined);

  hasQuery = computed(() => this.project()?.queryId !== undefined);

  dataTypesIds = computed(() => this.dataTypes().map(dt => dt.dataTypeId));
  hasDatasetConfig = computed(() => hasExportSelections(this.exportConfig()));

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
    const ontologyIds: string[] = this.query()!.query.map(q => q.ontologyId);
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

  save() {
    const existingConfig = {
      ...this.exportConfig(),
      // selectedDataIds: this.selectedDataIds(),
    };
    this.store.dispatch(ProjectActions.update({
      project: {
        ...this.project(),
        exportConfig: existingConfig
      }
    }))
  }

  toggleSetting() {
    this.showSetting.update(s => !s);
  }

  openDatasetBuilder(): void {
    if (!this.project()?.id) {
      return;
    }

    this.router.navigate(['/project', this.project().id, 'dataset-builder']);
  }
}
