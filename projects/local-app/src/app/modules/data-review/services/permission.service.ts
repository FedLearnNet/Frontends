import { Injectable } from '@angular/core';
import { GROUPS_AND_USERS, APPLICATIONS, PERMISSIONS } from '@local-app/data-review/services/mock';
import { Observable, of } from 'rxjs';
import { Permission, Group, Application } from '@local-app/data-review/models';
import { cloneDeep } from 'lodash';
import { SharedCohortService } from '@local-app/utils/services/shared-cohort.service';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    protected permissionsList: Permission[] = [];

    constructor(
        private sharedCohortService: SharedCohortService,
    ) { }

    getAllPermissions(): Observable<Permission[]> {
        if (this.permissionsList.length === 0) {
            this.permissionsList = PERMISSIONS;
        }

        return of(this.getReturnablePermissionList());
    }

    getPermission(permissionId: number): Observable<Permission | undefined> {
        return of(this.permissionsList.find(permission => permission.id === permissionId));
    }

    getAllGroupsAndUsers(): Observable<Group[]> {
        return of(GROUPS_AND_USERS);
    }

    getAllApplications(): Observable<Application[]> {
        return of(APPLICATIONS);
    }

    createPermission(selectedCohorts: number[], selectedGroupsOrUsers: number[], permissions: any): Observable<Permission[]> {
        selectedCohorts.forEach(selectedCohort => {
            selectedGroupsOrUsers.forEach(selectedGroupOrUser => {
                this.createNewPermission({
                    cohort: selectedCohort,
                    groupOrUser: selectedGroupOrUser,
                    permissions: permissions,
                } as Permission);
            });
        });

        return of(this.getReturnablePermissionList())
    }

    createNewPermission(permission: Permission): void {
        const nextPermissionId = this.permissionsList.map(permission => permission.id).sort().pop() ?? 1;
        const permissions: any = cloneDeep(permission.permissions);

        Object.keys(permission.permissions).forEach((key) => {
            permissions[key] = permissions[key]?.checked ? permissions[key].value : null;
        });

        this.permissionsList.push(<Permission>{
            ...permission,
            id: nextPermissionId + 1,
            permissions: permissions,
        });
    }

    updatePermission(permissionData: Permission): Observable<Permission[]> {
        const permissions: any = permissionData.permissions;
        const permissionIndex = this.permissionsList.findIndex(permission => permission.id === permissionData.id);

        Object.keys(permissionData.permissions).forEach((key) => {
            permissions[key] = permissions[key]?.checked ? permissions[key].value : null;
        });

        this.permissionsList[permissionIndex] = {
            ...this.permissionsList[permissionIndex],
            ...permissionData,
            permissions: permissions,
        };

        return of(this.getReturnablePermissionList());
    }

    deletePermission(permissionId: number): Observable<Permission[]> {
        this.permissionsList = this.permissionsList.filter(permission => permission.id !== permissionId);

        return of(this.getReturnablePermissionList());
    }

    private getReturnablePermissionList(): Permission[] {
        let cohortList: CohortListItem[] = [];
        const returnablePermissionList = cloneDeep(this.permissionsList);

        this.sharedCohortService.getCohortList().subscribe(cohorts => cohortList = cohorts);

        this.permissionsList.forEach((permission, index) => {
            returnablePermissionList[index].cohort = cohortList.find(cohort => cohort.id === this.permissionsList[index].cohort)?.name ?? '';
            returnablePermissionList[index].groupOrUser = GROUPS_AND_USERS.find(groupAndUser => groupAndUser.id === this.permissionsList[index].groupOrUser)?.name ?? '';
            returnablePermissionList[index].permissions.accessWith = APPLICATIONS.find(application => application.id === this.permissionsList[index].permissions.accessWith)?.name ?? null;
        });

        return returnablePermissionList;
    }
}
