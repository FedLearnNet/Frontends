import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, map, Observable, of} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {HttpParams} from "@angular/common/http";
import {ConnectorRunDTO} from "../dto/run";
import {ConnectorRunLogRowDTO, ConnectorRunPatientLogDTO, RunErrorLogListResponseDTO} from "../dto/log";
import {RunLogsType} from "../enum/run-logs";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from '@local-app/cohort/dto/schema';
import {ConnectorMappingConfig} from '../models/connector-model';
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';

type MappingObject = Record<string, string>;

interface MappingArrayItem {
  column: string;
  mapping: string;
}

type MappingInput = MappingObject | MappingArrayItem[];

@Injectable({
  providedIn: 'root'
})
export class ConnectorRunService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'connectors/runs'


  public get(runId: number | string | null): Observable<ConnectorRunDTO | null> {
    if (!runId) {
      return of(null);
    }
    if (typeof runId === 'string') {
      runId = parseInt(runId);
    }

    return this.apiService.get<ConnectorRunDTO>(`${this.getBaseUrl()}/${runId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GET', {name: this.translate.instant('GRID.RUN').toLowerCase()}))),
    );
  }

  public runConnector(connectorId: number, deleteExistingPatients: boolean, dryRun: boolean): Observable<ConnectorRunDTO> {
    const params = new HttpParams()
      .set('delete-existing-patients', deleteExistingPatients)
      .set('dry', dryRun);

    return this.apiService.post<ConnectorRunDTO>(
      `${this.apiUrl}/connectors/${connectorId}/run`,
      {},
      undefined,
      params
    ).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_RUN', {name: this.translate.instant('GRID.CONNECTOR').toLowerCase()}))),
    );
  }

  public getAllForConnector(connectorId: number): Observable<ConnectorRunDTO[]> {
    return this.apiService.get<ConnectorRunDTO[]>(`${this.getBaseUrl()}/connectors/${connectorId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.RUNS').toLowerCase()}))),
      );
  }


  getRunErrorLogs(runId: number, logsType: RunLogsType = RunLogsType.RUN_ERROR): Observable<ConnectorRunPatientLogDTO[]> {
    const isHarmonizer = logsType === RunLogsType.HARMONIZER;

    const params = new HttpParams({
      fromObject: {
        patient: isHarmonizer ? 'yes' : 'no',
      }
    });

    return this.apiService.get<RunErrorLogListResponseDTO>(`${this.getBaseUrl()}/${runId}/run-logs`, params)
      .pipe(
        map(response => response.logs ?? []),
        catchError(err => {
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {
              name: this.translate.instant('GRID.ERROR_LOGS').toLowerCase()
            })
          );
          return of([]);
        })
      );
  }

  getErrorLogs(runId: number): Observable<ConnectorRunLogRowDTO[]> {
    return this.apiService.get<ConnectorRunLogRowDTO[]>(`${this.getBaseUrl()}/${runId}/logs`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ERROR_LOGS').toLowerCase()}))),
      );
  }

  findUnmappedRequiredFields(node: SchemaRootNodeDto | SchemaNodeNestedDto, mappings: ConnectorMappingConfig[] | MappingInput = [], unmappedFields: string[] = []): string[] {
    if (node.nodeType === SchemaNodeTypeEnum.ATTRIBUTE) {
      const mappedIds = this.normalizeMappings(mappings);
      const attributeNode = node as SchemaNodeNestedDto;

      const hasValidation = !!attributeNode.dataType?.validations?.length;
      let isRequired = false;
      if (hasValidation) {
        isRequired = !!attributeNode.dataType.isRequired
      }

      const nodeGlobalId = attributeNode.globalId !== UNIQUE_PATIENT_ID_NODE.globalId
        ? attributeNode.name
        : UNIQUE_PATIENT_ID_NODE.name;

      const isMapped = Array.from(mappedIds).some(mappedValue =>
        mappedValue.endsWith(nodeGlobalId)
      );

      if (isRequired && !isMapped) {
        unmappedFields.push(nodeGlobalId);
      }
    }

    for (const child of node.childNodes ?? []) {
      this.findUnmappedRequiredFields(child, mappings, unmappedFields);
    }

    return unmappedFields;
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  private normalizeMappings(mappings: ConnectorMappingConfig[] | MappingInput): Set<string> {
    if (Array.isArray(mappings)) {
      return new Set(
        mappings
          .map(m => m.mapping)
          .filter((m): m is string => typeof m === 'string' && m.length > 0)
      );
    }

    return new Set(
      Object.values(mappings)
        .filter((m): m is string => typeof m === 'string' && m.length > 0)
    );
  }
}
