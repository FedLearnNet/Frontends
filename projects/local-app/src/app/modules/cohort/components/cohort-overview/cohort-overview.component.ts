import {Component, computed, DestroyRef, effect, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {SMALL} from '@shared-lib/constants';
import {CohortDetailDto, isCohortDeleting} from '@local-app/cohort/models';
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {CohortService} from "@local-app/cohort/services/cohort.service";
import {PaginatedResponse} from "@shared-lib/models";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SchemaDetailComponent} from "@local-app/cohort/components/schema-detail/schema-detail.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatButtonModule} from "@angular/material/button";
import {CohortDetailComponent} from "@local-app/cohort/components/cohort-detail/cohort-detail.component";
import {CohortPatientsComponent} from "@local-app/cohort/components/cohort-patients/cohort-patients.component";
import {
  PatientDetailQueryabilityFormComponent
} from "@local-app/cohort/components/patient-detail-queryability-form/patient-detail-queryability-form.component";
import {DynamicFormService} from "@local-app/cohort/services/dynamic-form.service";
import {first, Subscription} from "rxjs";
import {
  DataExportConfigDialogComponent
} from "@shared-lib/modules/data-modeler/components/data-export-config-dialog/data-export-config-dialog.component";
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {SchemaService} from '@local-app/cohort/services/schema.service';
import {SchemaNodeNestedDto} from '@local-app/cohort/dto/schema';
import {CohortStatisticsComponent} from "@local-app/cohort/components/cohort-statistics/cohort-statistics.component";
import {CohortMembersComponent} from "@local-app/cohort/components/cohort-members/cohort-members.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {PermissionGridComponent} from "@local-app/data-review/components/permission-grid/permission-grid.component";
import {CohortStarService} from "@local-app/utils/services/cohort-star.service";
import {NgClass} from "@angular/common";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";

@Component({
  selector: 'app-cohort-overview',
  templateUrl: './cohort-overview.component.html',
  styleUrl: './cohort-overview.component.scss',
  imports: [
    MatTabsModule,
    TranslatePipe,
    SchemaDetailComponent,
    ErrorCardComponent,
    MatButtonModule,
    CohortDetailComponent,
    CohortMembersComponent,
    CohortPatientsComponent,
    CohortStatisticsComponent,
    PatientDetailQueryabilityFormComponent,
    MatIconModule,
    MatTooltip,
    HeaderComponent,
    PageWrapperComponent,
    BtnComponent,
    PermissionGridComponent,
    NgClass,
    StatusBadgeComponent,
  ]
})
export class CohortOverviewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly cohortService: CohortService = inject(CohortService);
  private readonly router: Router = inject(Router);
  private readonly dynamicFormService: DynamicFormService = inject(DynamicFormService);
  private readonly schemaService: SchemaService = inject(SchemaService);
  private readonly cohortStars: CohortStarService = inject(CohortStarService);

  isLargeScreen: boolean = true;

  isStarred = computed(() => {
    const c = this.cohort();
    return !!c && this.cohortStars.starredIds().includes(String(c.id));
  });

  toggleStar() {
    if (this.isDeleting()) {
      return;
    }
    const c = this.cohort();
    if (c) this.cohortStars.toggle(String(c.id));
  }

  cohort = signal<CohortDetailDto | undefined>(undefined);
  isEditing = signal<boolean>(false);
  selectedTabIndex = signal<number>(0);
  patients = signal<PaginatedResponse<any> | undefined>(undefined);
  isDeleting = computed(() => isCohortDeleting(this.cohort()));

  private deletionPollSub?: Subscription;

  constructor() {
    this.destroyRef.onDestroy(() => this.deletionPollSub?.unsubscribe());
  }

  schema = computed(() => {
    if (!this.cohort()) return undefined;

    return this.cohort()?.schemaRoot;
  });

  private readonly tabNames = computed<string[]>(() =>
    this.schema() ? ['Details', 'Schema', 'Queryability', 'Access management', 'Statistics', 'Patients', 'Members'] :
      ['Details', 'Statistics', 'Patients', 'Members']
  );

  schemaDynamicFormConfig = computed(() => {
    if (!this.cohort()) return [];

    return this.dynamicFormService.getDynamicFormConfig(this.schema()?.childNodes);
  });

  private _changeEffect = effect(() => {
    const idx = this.selectedTabIndex();
    const frag = this.indexToFragment(idx);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      fragment: frag,
      queryParamsHandling: 'preserve',
      replaceUrl: true,
    });
  });


  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({cohort, allData}) => {
      this.cohort.set({
        ...cohort,
        schemaRoot: {
          ...cohort.schemaRoot,
          childNodes:
            this.schemaService.sortSchemaNodes(
              cohort?.schemaRoot.childNodes as SchemaNodeNestedDto[],
              'name'
            ),
        }
      } as CohortDetailDto);
      this.patients.set(allData);
      this.resumeDeletionPollingIfNeeded();
    });
    this.activatedRoute.fragment.pipe(first())
      .subscribe(f => {
        const idx = this.fragToIndex(f);
        if (idx !== this.selectedTabIndex()) {
          this.selectedTabIndex.set(idx);
        }
      });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .isScreenSizeGreaterThan(SMALL)
      .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);
  }

  deleteCohort(): void {
    if (!this.cohort() || this.isDeleting()) {
      return;
    }
    const cohort = this.cohort()!;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETE_COHORT.TITLE'),
        message: this.translate.instant('DIALOG.DELETE_COHORT.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.cohortService.deleteCohort(cohort.id).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (cohortId) => {
          this.markCohortDeleting();
          this.startDeletionPolling(cohortId);
        },
      });
    });
  }

  exportCohort(): void {
    if (!this.cohort() || this.isDeleting()) {
      return;
    }
    this.dialog.open(DataExportConfigDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {
        cohort: this.cohort(),
      },
    });
  }

  toggleEdit() {
    if (this.isDeleting()) {
      return;
    }
    this.isEditing.update(v => !v);
  }

  setSelectedTabIndex(index: number): void {
    this.selectedTabIndex.set(index);
  }

  navigateToConnectors(): void {
    if (this.isDeleting()) {
      return;
    }
    this.router.navigate(['connector'], {relativeTo: this.activatedRoute});
  }

  private resumeDeletionPollingIfNeeded(): void {
    const cohort = this.cohort();
    if (!isCohortDeleting(cohort)) {
      return;
    }
    this.startDeletionPolling(cohort!.id);
  }

  private markCohortDeleting(): void {
    this.cohort.update(current => current ? {
      ...current,
      deletionInProgress: true,
    } : current);
    if (this.isEditing()) {
      this.isEditing.set(false);
    }
  }

  private startDeletionPolling(cohortId: number): void {
    this.deletionPollSub?.unsubscribe();
    this.deletionPollSub = this.cohortService.pollCohortUntilDeleted(cohortId).subscribe({
      next: (event) => {
        if (event.type === 'completed') {
          this.deletionPollSub?.unsubscribe();
          this.deletionPollSub = undefined;
          this.onDeletionCompleted();
          return;
        }
        this.cohort.update(current => current ? {
          ...current,
          ...event.cohort,
          schemaRoot: current.schemaRoot ?? event.cohort.schemaRoot,
        } : current);
      },
      error: () => {
        this.deletionPollSub?.unsubscribe();
        this.deletionPollSub = undefined;
      },
    });
  }

  private onDeletionCompleted(): void {
    this.snackBar.open(
      this.translate.instant('COHORT_DELETION.SUCCESS'),
      this.translate.instant('BUTTON.CLOSE'),
      {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      },
    );
    this.cohortService.notifyCohortsChanged();
    this.router.navigate(['/cohort']);
  }

  private indexToFragment = (i: number): string | undefined => this.tabNames()[i];
  private fragToIndex = (f: string | null): number => {
    const names = this.tabNames();
    const idx = f ? names.indexOf(f) : -1;
    return idx >= 0 ? idx : 0;
  };
}
