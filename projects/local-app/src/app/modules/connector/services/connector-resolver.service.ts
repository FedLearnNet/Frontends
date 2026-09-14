import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {ConnectorService} from "./connector-crud.service";
import {connectorDTOToConfig} from "../models/connector-config";
import {catchError, map, of, switchMap, tap} from "rxjs";
import {ConnectorUploadService} from "./connector-upload.service";
import {connectorFilesDetailToFileInfo, isFileUploadSettings, mergeFileInfo} from "../helper/connector-config-helper";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {setMissingFileInfo} from '@shared-lib/utils';
import { ConnectorDTO, ConnectorInputConfigDTO } from "../dto/connector";


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
              for (const [sheetName, dto] of Object.entries(fileInfoMap)) {
                if (connector.fileInfo) {
                  const oldDto = connector.fileInfo[sheetName];
                  if (oldDto) {
                    dto.renamedColumns = oldDto.renamedColumns ?? dto.columns;
                    dto.deletedColumns = oldDto.deletedColumns ?? new Array(dto.columns.length).fill(false);
                  }
                }
              }
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


function dispatchLoadApps(store: Store, connector: ConnectorDTO) {
  const appVersionIds: number[] =
    connector.transformer
      ?.map(t => t.appVersionId == null ? undefined : Number(t.appVersionId))
      .filter((id): id is number => Number.isFinite(id)) ?? [];

  if (appVersionIds.length) {
    store.dispatch(StoreActions.loadAppsByVersions({appVersionIds}));
  }
}
