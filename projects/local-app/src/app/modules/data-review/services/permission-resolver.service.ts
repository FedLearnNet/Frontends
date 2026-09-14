import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PermissionDTO } from '@local-app/data-review/models';
import { PermissionService } from '@local-app/data-review/services/permission.service';

export const permissionListResolver: ResolveFn<PermissionDTO[]> = () => {
  return inject(PermissionService).getAllPermissions();
}
