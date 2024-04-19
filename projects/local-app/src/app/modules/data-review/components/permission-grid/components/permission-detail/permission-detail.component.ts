import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectOption } from '@shared-lib/models';
import { PermissionService } from '@local-app/data-review/services/permission.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Group, Permission } from '@local-app/data-review/models';
import { cloneDeep } from 'lodash';
import { MatSelectChange } from '@angular/material/select';
import { SharedCohortService } from '@local-app/utils/services/shared-cohort.service';

@Component({
    selector: 'app-permission-detail',
    templateUrl: './permission-detail.component.html',
    styleUrl: './permission-detail.component.scss',
})
export class PermissionDetailComponent {
    cohortSelectOptions: SelectOption[];
    groupAndUserSelectOptions: SelectOption[];
    applications: SelectOption[];
    permissionDetail: Permission | null;
    permissions: Permission[];
    groupAndUserList: Group[];

    permissionForm = this.formBuilder.nonNullable.group({
        cohort: [null, Validators.required],
        groupOrUser: [[], Validators.required],
        permissions: this.formBuilder.group({
            querySampleThreshold: this.formBuilder.group({
                checked: [false, Validators.required],
                value: [100, Validators.required],
            }),
            specificGroupInterval: this.formBuilder.group({
                checked: [false, Validators.required],
                value: [3, Validators.required],
            }),
            anyGroupInterval: this.formBuilder.group({
                checked: [false, Validators.required],
                value: [1, Validators.required],
            }),
            maxQueryLimit: this.formBuilder.group({
                checked: [false, Validators.required],
                value: [50, Validators.required],
            }),
            accessWith: this.formBuilder.group({
                checked: [false, Validators.required],
                value: [1, Validators.required],
            }),
        }),
    });

    constructor(
        public dialogRef: MatDialogRef<PermissionDetailComponent>,

        @Inject(MAT_DIALOG_DATA) public data: any,

        private formBuilder: FormBuilder,
        private sharedCohortService: SharedCohortService,
        private permissionService: PermissionService,
    ) { }

    ngOnInit() {
        this.permissionDetail = cloneDeep(this.data.permission);

        this.loadCohorts();
        this.loadGroupsAndUsers();
        this.loadApplications();
        this.loadPermissions();
        this.patchPermission();
    }

    loadCohorts(): void {
        this.sharedCohortService.getCohortList()
            .subscribe(cohortList =>
                this.cohortSelectOptions = cohortList.map(cohort => {
                    return { value: cohort.id, label: cohort.name } as SelectOption
                })
            );
    }

    loadGroupsAndUsers(): void {
        this.permissionService.getAllGroupsAndUsers()
            .subscribe(groupAndUserList => {
                this.groupAndUserList = groupAndUserList;

                this.loadGroupOrUserSelectOptions(this.groupAndUserList);
            });
    }

    loadApplications(): void {
        this.permissionService.getAllApplications()
            .subscribe(applicationList =>
                this.applications = applicationList.map(application => {
                    return { value: application.id, label: application.name } as SelectOption
                })
            );
    }

    patchPermission(): void {
        if (!this.isEdit()) return;

        this.permissionForm.patchValue({
            cohort: [this.permissionDetail?.cohort],
            groupOrUser: [this.permissionDetail?.groupOrUser],
        } as any);

        this.permissionForm.get('cohort')?.disable();
        this.permissionForm.get('groupOrUser')?.disable();

        const permissions = this.permissionDetail?.permissions as any;
        const permissionKeys = ['querySampleThreshold', 'specificGroupInterval', 'anyGroupInterval', 'maxQueryLimit', 'accessWith']

        permissionKeys.forEach(permissionsKey => {
           this.permissionForm.patchValue({
               ...this.permissionForm.getRawValue(),
               permissions: {
                   [permissionsKey]: {
                       checked: permissions[permissionsKey] !== null,
                       value: permissions[permissionsKey],
                   },
               },
           });

           const formControl = this.permissionForm.get(`permissions.${permissionsKey}.value`);
           if (permissions[permissionsKey] === null) {
               formControl?.clearValidators();
           } else {
               formControl?.setValidators([Validators.required]);
           }

           this.permissionForm.get(permissionsKey)?.updateValueAndValidity();
        });
    }

    loadPermissions(): void {
        this.permissionService.getAllPermissions()
            .subscribe(permissionList => this.permissions = permissionList);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        this.permissionForm.markAllAsTouched();

        if (this.permissionForm.invalid) return;

        this.dialogRef.close({... this.permissionDetail, ...this.permissionForm.getRawValue()});
    }

    slideToggleChanged(event: MatSlideToggleChange): void {
        const formControl = this.permissionForm.get(`permissions.${ event.source.name }.value`);

        if (event.checked) {
            formControl?.setValidators([Validators.required]);
            formControl?.updateValueAndValidity();

            return;
        }

        formControl?.clearValidators();
        formControl?.updateValueAndValidity();
    }

    getDialogTitle(): string {
        return `${ this.isEdit() ? 'Update' : 'Add' } permission`;
    }

    getSubmitButtonLabel(): string {
        return `Accept and ${ this.isEdit() ? 'update' : 'add' }`;
    }

    isEdit(): boolean {
        return this.permissionDetail?.id !== undefined;
    }

    cohortSelectionChange(event: MatSelectChange): void {
        this.permissionForm.get('groupOrUser')?.reset();

        const selectedCohorts = this.cohortSelectOptions
            .filter(cohortSelectOption => event.value.includes(cohortSelectOption.value))
            .map(cohortSelectOption => cohortSelectOption.label);

        const existingGroupOrUserIds = [...new Set(this.permissions
            .filter(permission => selectedCohorts.includes(permission.cohort.toString()))
            .map(permission => permission.groupOrUser))];

        this.loadGroupOrUserSelectOptions(
            this.groupAndUserList.filter(groupOrUser => !existingGroupOrUserIds.includes(groupOrUser.name))
        );
    }

    loadGroupOrUserSelectOptions(groupOrUserList: Group[]): void {
        this.groupAndUserSelectOptions = groupOrUserList.map(groupOrUser => {
            return { value: groupOrUser.id, label: groupOrUser.name } as SelectOption
        })
    }
}
