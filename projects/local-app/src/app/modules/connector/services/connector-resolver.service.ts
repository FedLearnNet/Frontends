import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {ConnectorService} from "./connector-crud.service";
import {connectorDTOToConfig} from "../models/connector-config";
import {catchError, forkJoin, map, Observable, of, switchMap, tap} from "rxjs";
import {ConnectorUploadService} from "./connector-upload.service";
import {
  appOutputsToFileInfo,
  connectorFilesDetailToFileInfo,
  filterSelectedOutputs,
  isAppBasedUploadSettings,
  isFileUploadSettings,
  mergeFileInfo
} from "../helper/connector-config-helper";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {setMissingFileInfo} from '@shared-lib/utils';
import {ConnectorDTO, ConnectorInputConfigDTO} from "../dto/connector";
import {UploadInfoDTO} from "../dto/upload-info";
import {AppBasedUploadSettings} from "../models/input-config";


export const connectorResolver: ResolveFn<ConnectorDTO> = (route: ActivatedRouteSnapshot) => {
  const service = inject(ConnectorService);
  const store = inject(Store);
  return service.get(route.paramMap.get('connector-id')).pipe(
    tap(connector => dispatchLoadApps(store, connector)),
    map(connector => connectorDTOToConfig(connector)),
  );
}

export const connectorAndFileResolver: ResolveFn<ConnectorDTO | null> =
  (route: ActivatedRouteSnapshot) => {

    const connectorService = inject(ConnectorService);
    const uploadService = inject(ConnectorUploadService);
    const store = inject(Store);

    return connectorService.get(route.paramMap.get('connector-id')).pipe(
      tap(connector => dispatchLoadApps(store, connector)),
      map(connector => connectorDTOToConfig(connector)),
      switchMap((connector) => {
        if (connector.inputConfig && isAppBasedUploadSettings(connector.inputConfig)) {
          return withAppOutputFileInfo(connector, uploadService);
        }

        if (!connector.inputConfig || !isFileUploadSettings(connector.inputConfig) || !connector.inputConfig.fileId) {
          return of(connector);
        }

        return uploadService.getFileDetail(connector.cohortId!, connector.inputConfig.fileId)
          .pipe(
            map((fileInfoDetail) => {
              if (('fileExists' in fileInfoDetail) && !fileInfoDetail.fileExists) {
                connector.inputConfig = {
                  ...connector.inputConfig,
                  fileExists: false,
                } as ConnectorInputConfigDTO;

                return connector;
              }
              const fileInfoMap = connectorFilesDetailToFileInfo(fileInfoDetail);
              keepColumnEdits(fileInfoMap, connector.fileInfo);
              if (connector.mergeConfig
                && Object.keys(fileInfoMap).length > 1) {
                connector.fileInfo =
                  mergeFileInfo(fileInfoMap, connector.mergeConfig);
              } else {
                connector.fileInfo = fileInfoMap;
              }
              return connector;
            }),
            catchError((error) => {
              if (error.isFileMissing) {
                return of(setMissingFileInfo(connector));
              }

              return of(connector);
            })
          );
      }),
      catchError((error) => {
        console.error('Resolver error:', error);

        return of(null);
      }),
    );
  };


function withAppOutputFileInfo(
  connector: ConnectorDTO,
  uploadService: ConnectorUploadService,
): Observable<ConnectorDTO> {
  const inputConfig = connector.inputConfig as AppBasedUploadSettings;
  const outputs = Object.entries(inputConfig.outputParams ?? {})
    .filter(([, fileId]) => fileId !== null && fileId !== undefined);
  if (outputs.length === 0 || connector.cohortId == null) {
    return of(connector);
  }

  return forkJoin(outputs.map(([name, fileId]) =>
    uploadService.getFileDetail(connector.cohortId!, fileId).pipe(
      map(detail => ({name, detail})),
      catchError(() => of(null)),
    )
  )).pipe(
    map(results => {
      const fileInfo = filterSelectedOutputs(
        appOutputsToFileInfo(results.flatMap(result => result ? [result] : [])),
        inputConfig.selectedOutputs);
      if (Object.keys(fileInfo).length === 0) {
        return connector;
      }
      keepColumnEdits(fileInfo, connector.fileInfo);
      connector.fileInfo = connector.mergeConfig && Object.keys(fileInfo).length > 1
        ? mergeFileInfo(fileInfo, connector.mergeConfig)
        : fileInfo;
      return connector;
    }),
  );
}

function keepColumnEdits(
  fileInfo: Record<string, UploadInfoDTO>,
  saved?: Record<string, UploadInfoDTO>,
): void {
  if (!saved) {
    return;
  }
  for (const [sheetName, dto] of Object.entries(fileInfo)) {
    const oldDto = saved[sheetName];
    if (oldDto) {
      dto.renamedColumns = oldDto.renamedColumns ?? dto.columns;
      dto.deletedColumns = oldDto.deletedColumns ?? new Array(dto.columns.length).fill(false);
    }
  }
}

function dispatchLoadApps(store: Store, connector: ConnectorDTO) {
  const appVersionIds: number[] =
    connector.transformer
      ?.map(t => t.appVersionId == null ? undefined : Number(t.appVersionId))
      .filter((id): id is number => Number.isFinite(id)) ?? [];

  if (appVersionIds.length) {
    store.dispatch(StoreActions.loadAppsByVersions({appVersionIds}));
  }
}
