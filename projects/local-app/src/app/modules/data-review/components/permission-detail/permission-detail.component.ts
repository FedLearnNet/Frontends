import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SelectOption} from '@shared-lib/models';
import {PermissionService} from '@local-app/data-review/services/permission.service';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {cloneDeep} from 'lodash';
import {map} from "rxjs";
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  AutoMetricsAccess,
  AutoStatisticsAccess,
  AutoTrainingAccess,
  CreatePermissionDTO,
  PermissionDTO
} from "@local-app/data-review/models";
import {CohortDetailDto, CohortDto} from '@local-app/cohort/models';

import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDivider} from "@angular/material/divider";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatInputModule} from "@angular/material/input";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";

// Extend SelectOption with an interface that includes the 'type' property
interface GroupOrUserOption extends SelectOption {
  type: 'user' | 'group';
}

interface PermissionDetailComponentData {
  permission: PermissionDTO | null,
  cohort?: CohortDetailDto | undefined;
}

@Component({
  selector: 'app-permission-detail',
  templateUrl: './permission-detail.component.html',
  styleUrls: ['./permission-detail.component.scss'],
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TranslatePipe,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDivider,
    MatSelectModule,
    MatSlideToggle,
    MatTooltip,
    MatInputModule,
    MatDatepickerModule,
  ],
})
export class PermissionDetailComponent implements OnInit {
  private readonly permissionService: PermissionService = inject(PermissionService);
  private readonly cohortService: CohortService = inject(CohortService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialogRef: MatDialogRef<PermissionDetailComponent> = inject(MatDialogRef);
  readonly data: PermissionDetailComponentData = inject<PermissionDetailComponentData>(MAT_DIALOG_DATA);

  cohortSelectOptions: SelectOption[];
  groupAndUserSelectOptions: GroupOrUserOption[];
  permissionDetail: PermissionDTO | null;

  permissionForm = this.formBuilder.group({
    cohort: [null as number | null, Validators.required],
    user: ['',],
    validFrom: [null as Date | null],
    validUntil: [null as Date | null],
    permissions: this.formBuilder.group({
      isAllowedToQuery: [false, Validators.required],
      retryTimeToQuery: [
        null as number | null,
        [Validators.required, Validators.min(3), Validators.max(10)],
      ],
      querySampleThreshold: [100, [Validators.required, Validators.min(100)]],
      autoTrainingAccess: [AutoTrainingAccess.ALL, Validators.required],
      autoStatisticsAccess: [AutoStatisticsAccess.ALL, Validators.required],
      autoMetricsAccess: [AutoMetricsAccess.ALL, Validators.required],
    }),
  });

  ngOnInit() {
    this.permissionDetail = cloneDeep(this.data.permission);

    if (this.data.cohort) {
      this.cohortSelectOptions = [{
        value: this.data.cohort.id, label: this.data.cohort.name
      }];
    } else {
      this.loadCohorts();
    }
    this.loadGroupsAndUsers();
    this.patchPermission();

    this.permissionForm.get('permissions.isAllowedToQuery')!.valueChanges.subscribe(value => {
      const retryTimeToQueryControl = this.permissionForm.get('permissions.retryTimeToQuery');
      const querySampleThresholdControl = this.permissionForm.get('permissions.querySampleThreshold');

      if (value) {
        retryTimeToQueryControl!.setValidators([Validators.required, Validators.min(3), Validators.max(10)]);
        querySampleThresholdControl!.setValidators([Validators.required, Validators.min(100)]);
        retryTimeToQueryControl!.enable();
        querySampleThresholdControl!.enable();
      } else {
        retryTimeToQueryControl!.clearValidators();
        querySampleThresholdControl!.clearValidators();
        retryTimeToQueryControl!.disable();
        querySampleThresholdControl!.disable();
      }

      retryTimeToQueryControl!.updateValueAndValidity();
      querySampleThresholdControl!.updateValueAndValidity();
    });
  }

  loadCohorts(): void {
    this.cohortService.getCohorts()
      .pipe(map((cohorts: CohortDto[]) => cohorts.map(
        (cohort: CohortDto) => ({value: cohort.id, label: cohort.name})
      )))
      .subscribe((schemas: SelectOption[]) => {
        this.cohortSelectOptions = schemas;
      });
  }

  loadGroupsAndUsers(): void {
    // Modify code to dynamically load groups and users from an endpoint
    // For now, using dummy data
    this.groupAndUserSelectOptions = [
      {value: 'u1', label: 'User 1', type: 'user'},
      {value: 'u2', label: 'User 2', type: 'user'},
      {value: 'g1', label: 'Group 1', type: 'group'},
      {value: 'g2', label: 'Group 2', type: 'group'},
    ];
    // TODO: Replace dummy data with actual endpoint call
  }

  patchPresetCohortPermission(): void {
    if (this.data.cohort) {
      this.permissionForm.patchValue({
        cohort: this.data.cohort.id
      });
      this.permissionForm.get('cohort')?.disable();
    }
  }

  patchPermission(): void {
    if (!this.isEdit()) {
      this.permissionForm.get('permissions.retryTimeToQuery')?.disable();
      this.permissionForm.get('permissions.querySampleThreshold')?.disable();

      this.patchPresetCohortPermission();
      return;
    }

    this.permissionForm.patchValue({
      cohort: this.permissionDetail?.cohortId,
      user: this.permissionDetail?.userId || '',
      validFrom: this.permissionDetail?.validFrom ? new Date(this.permissionDetail.validFrom) : null,
      validUntil: this.permissionDetail?.validUntil ? new Date(this.permissionDetail.validUntil) : null,
      permissions: {
        isAllowedToQuery: this.permissionDetail?.isAllowedToQuery ?? false,
        retryTimeToQuery: this.permissionDetail?.queryRetryTime ?? 3,
        autoTrainingAccess: this.permissionDetail?.autoTrainingAccess || null,
        autoStatisticsAccess: this.permissionDetail?.autoStatisticsAccess || null,
        autoMetricsAccess: this.permissionDetail?.autoMetricsAccess || null,
        querySampleThreshold: this.permissionDetail?.querySampleThreshold ?? 100,
      },
    });

    this.permissionForm.get('cohort')?.disable();
    this.permissionForm.get('group')?.disable();
    this.permissionForm.get('user')?.disable();
    if (!this.permissionDetail?.isAllowedToQuery) {
      this.permissionForm.get('permissions.retryTimeToQuery')?.disable();
      this.permissionForm.get('permissions.querySampleThreshold')?.disable();
    }
    this.patchPresetCohortPermission();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.permissionForm.markAllAsTouched();

    if (this.permissionForm.invalid) return;

    if (this.isEdit()) {
      if (!this.permissionDetail) {
        return;
      }
      // Update existing permission
      const permissionData = this.prepareUpdatePermissionData();
      this.permissionService
        .updatePermission(permissionData)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      // Create new permission via API
      const permissionData = this.prepareCreatePermissionData();
      this.permissionService
        .createPermission(permissionData)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    }
  }

  prepareUpdatePermissionData(): PermissionDTO {
    const formValue = this.permissionForm.getRawValue();
    return {
      ...this.permissionDetail,
      cohortId: formValue.cohort ?? this.permissionDetail?.cohortId,
      isAllowedToQuery: formValue.permissions.isAllowedToQuery ?? false,
      queryRetryTime: formValue.permissions.retryTimeToQuery ?? null,
      autoTrainingAccess: formValue.permissions.autoTrainingAccess || null,
      autoStatisticsAccess: formValue.permissions.autoStatisticsAccess || null,
      autoMetricsAccess: formValue.permissions.autoMetricsAccess || null,
      querySampleThreshold: formValue.permissions.querySampleThreshold ?? null,
      userId: formValue.user || null,
      validFrom: this.toLocalDateString(formValue.validFrom),
      validUntil: this.toLocalDateString(formValue.validUntil),
    } as PermissionDTO;
  }

  prepareCreatePermissionData(): CreatePermissionDTO {
    const formValue = this.permissionForm.getRawValue();
    return {
      id: this.permissionDetail?.id,
      cohortId: formValue.cohort,
      isAllowedToQuery: formValue.permissions.isAllowedToQuery ?? false,
      queryRetryTime: formValue.permissions.retryTimeToQuery ?? null,
      autoTrainingAccess: formValue.permissions.autoTrainingAccess || null,
      autoStatisticsAccess: formValue.permissions.autoStatisticsAccess || null,
      autoMetricsAccess: formValue.permissions.autoMetricsAccess || null,
      querySampleThreshold: formValue.permissions.querySampleThreshold ?? null,
      userId: formValue.user || null,
      validFrom: this.toLocalDateString(formValue.validFrom),
      validUntil: this.toLocalDateString(formValue.validUntil),
    } as CreatePermissionDTO;
  }

  private toLocalDateString(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getDialogTitle(): string {
    return this.isEdit()
      ? this.translate.instant('UPDATE_NAME', {name: this.data.cohort?.name})
      : this.translate.instant('ADD_NAME', {name: this.data.cohort?.name});
  }

  getSubmitButtonLabel(): string {
    return this.isEdit()
      ? this.translate.instant('BUTTON.UPDATE')
      : this.translate.instant('BUTTON.CREATE');
  }

  isEdit(): boolean {
    return this.permissionDetail?.id !== undefined;
  }

  protected readonly AutoTrainingAccess = AutoTrainingAccess;
  protected readonly AutoStatisticsAccess = AutoStatisticsAccess;
  protected readonly AutoMetricsAccess = AutoMetricsAccess;
}
