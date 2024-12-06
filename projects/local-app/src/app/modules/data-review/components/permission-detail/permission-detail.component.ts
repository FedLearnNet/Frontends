import {Component, inject, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Schema, SelectOption} from '@shared-lib/models';
import {PermissionService} from '@local-app/data-review/services/permission.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Permission} from '@local-app/data-review/models';
import {cloneDeep} from 'lodash';
import {MatSelectChange} from '@angular/material/select';
import {map} from "rxjs";
import {SchemaService} from "@local-app/cohort/services/schema.service";

// Extend SelectOption with an interface that includes the 'type' property
interface GroupOrUserOption extends SelectOption {
  type: 'user' | 'group';
}

@Component({
  selector: 'app-permission-detail',
  templateUrl: './permission-detail.component.html',
  styleUrls: ['./permission-detail.component.scss'],
})
export class PermissionDetailComponent implements OnInit {
  private readonly permissionService: PermissionService = inject(PermissionService);
  private readonly schemaService: SchemaService = inject(SchemaService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly dialogRef: MatDialogRef<PermissionDetailComponent> = inject(MatDialogRef);
  readonly data: Permission | null = inject<Permission | null>(MAT_DIALOG_DATA);

  cohortSelectOptions: SelectOption[];
  groupAndUserSelectOptions: GroupOrUserOption[];
  permissionDetail: Permission | null;

  permissionForm = this.formBuilder.group({
    cohort: ['', Validators.required],
    user: ['',],
    group: ['',],
    permissions: this.formBuilder.group({
      isAllowedToQuery: [false, Validators.required],
      retryTimeToQuery: [
        null as number | null,
        [Validators.required, Validators.min(3), Validators.max(10)],
      ],
      querySampleThreshold: [100, [Validators.required, Validators.min(100)]],
      autoTrainingAccess: ['', Validators.required],
    }),
  });

  ngOnInit() {
    this.permissionDetail = cloneDeep(this.data);

    this.loadCohorts();
    this.loadGroupsAndUsers();
    this.patchPermission();

    this.permissionForm.get('user')!.valueChanges.subscribe(value => {
      if (value) {
        this.permissionForm.get('group')!.disable();
      } else {
        this.permissionForm.get('group')!.enable();
      }
    });

    this.permissionForm.get('group')!.valueChanges.subscribe(value => {
      if (value) {
        this.permissionForm.get('user')!.disable();
      } else {
        this.permissionForm.get('user')!.enable();
      }
    });

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
    this.schemaService.getSchemas()
      .pipe(map((cohorts: Schema[]) => cohorts.map(
        (cohort: any) => ({value: cohort.uniqueId, label: cohort.name})
      )))
      .subscribe((cohorts: SelectOption[]) => {
        this.cohortSelectOptions = cohorts;
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

  patchPermission(): void {
    if (!this.isEdit()) {
      this.permissionForm.get('permissions.retryTimeToQuery')?.disable();
      this.permissionForm.get('permissions.querySampleThreshold')?.disable();
      return;
    }

    this.permissionForm.patchValue({
      cohort: this.permissionDetail?.cohortId || '',
      group: this.permissionDetail?.groupId || '',
      user: this.permissionDetail?.userId || '',
      permissions: {
        isAllowedToQuery: this.permissionDetail?.isAllowedToQuery ?? false,
        retryTimeToQuery: this.permissionDetail?.queryRetryTime ?? 3,
        autoTrainingAccess: this.permissionDetail?.autoTrainingAccess || '',
        querySampleThreshold: this.permissionDetail?.querySampleThreshold ?? 100,
      },
    });

    this.permissionForm.get('cohort')?.disable();
    this.permissionForm.get('group')?.disable();
    this.permissionForm.get('user')?.disable();
    if(!this.permissionDetail?.isAllowedToQuery) {
      this.permissionForm.get('permissions.retryTimeToQuery')?.disable();
      this.permissionForm.get('permissions.querySampleThreshold')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.permissionForm.markAllAsTouched();

    if (this.permissionForm.invalid) return;

    const permissionData = this.preparePermissionData();

    if (this.isEdit()) {
      // Update existing permission
      this.permissionService
        .updatePermission(permissionData)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    } else {
      // Create new permission via API
      this.permissionService
        .createPermission(permissionData)
        .subscribe((response) => {
          this.dialogRef.close(response);
        });
    }
  }

  preparePermissionData(): Permission {
    const formValue = this.permissionForm.getRawValue();

    return {
      id: this.permissionDetail?.id,
      cohortId: formValue.cohort as string,
      isAllowedToQuery: formValue.permissions.isAllowedToQuery ?? false,
      queryRetryTime: formValue.permissions.retryTimeToQuery ?? null,
      autoTrainingAccess: formValue.permissions.autoTrainingAccess || null,
      querySampleThreshold: formValue.permissions.querySampleThreshold ?? null,
      groupId: formValue.group || null,
      userId: formValue.user || null,
    } as Permission;
  }

  getDialogTitle(): string {
    return `${this.isEdit() ? 'Update' : 'Add'} permission`;
  }

  getSubmitButtonLabel(): string {
    return this.isEdit() ? 'Update' : 'Create';
  }

  isEdit(): boolean {
    return this.permissionDetail?.id !== undefined;
  }

  cohortSelectionChange(event: MatSelectChange): void {
    // Implement any necessary logic when cohort selection changes
  }
}
