import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {of} from 'rxjs';
import {ConnectorFilesDTO, ConnectorFilesDetailDTO} from '../dto/upload-info';
import {ConnectorUploadService} from './connector-upload.service';

export const connectorFilesResolver: ResolveFn<ConnectorFilesDTO[]> = (route: ActivatedRouteSnapshot) => {
  const cohortId = Number(route.paramMap.get('cohortId'));

  if (!Number.isFinite(cohortId)) {
    return of([]);
  }

  return inject(ConnectorUploadService).getFiles(cohortId);
};

export const connectorFileDetailResolver: ResolveFn<ConnectorFilesDetailDTO | null> = (route: ActivatedRouteSnapshot) => {
  const cohortId = Number(route.paramMap.get('cohortId'));
  const fileId = Number(route.paramMap.get('fileId'));

  if (!Number.isFinite(cohortId) || !Number.isFinite(fileId)) {
    return of(null);
  }

  return inject(ConnectorUploadService).getFileDetail(cohortId, fileId);
};
