import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {ConnectorService} from "./connector-crud.service";
import {ConnectorConfig, connectorConfigDTOToConfig} from "../models/connector-config";
import {map, of, switchMap} from "rxjs";
import {ConnectorUploadService} from "./connector-upload.service";


export const connectorResolver: ResolveFn<ConnectorConfig> = (route: ActivatedRouteSnapshot) => {
  return inject(ConnectorService).get(route.paramMap.get('connector-id')).pipe(
    map((connector) => connectorConfigDTOToConfig(connector)),
  );
}


export const connectorAndFileResolver: ResolveFn<ConnectorConfig> = (route: ActivatedRouteSnapshot) => {
  const connectorService = inject(ConnectorService);
  const uploadService = inject(ConnectorUploadService);

  return connectorService.get(route.paramMap.get('connector-id')).pipe(
    map((connector) => connectorConfigDTOToConfig(connector)),
    switchMap((connector) => {
      if (!connector.inputConfig || connector.inputConfig.mode !== 'FILE') {
        return of(connector);
      }

      return uploadService.getFileInfo(connector.inputConfig).pipe(
        map((fileInfo) => {
          if (connector.fileInfo) {
            fileInfo.renamedColumns = connector.fileInfo?.renamedColumns || [];
            fileInfo.deletedColumns = connector.fileInfo?.deletedColumns || [];
          }
          connector.fileInfo = fileInfo;
          return connector;
        })
      );
    })
  );
}
