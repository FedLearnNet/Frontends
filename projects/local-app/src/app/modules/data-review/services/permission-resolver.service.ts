import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Permission } from '@local-app/data-review/models';
import { PermissionService } from '@local-app/data-review/services/permission.service';

export const permissionListResolver: ResolveFn<Permission[]> = () => {
  return inject(PermissionService).getAllPermissions();
}
