import {Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, map, Observable, of} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import {configToPreviewDTO, PreviewResponseDTO} from "../dto/preview";
import {ConnectorCard} from "../models/connector-card";
import {ConnectorConfig} from "../models/connector-config";
import {FunctionsDetailDTO} from "../dto/function";

@Injectable({
  providedIn: 'root'
})
export class ConnectorPreviewService {
  private readonly apiUrl;
  private readonly path = 'connector'

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.apiUrl = environment.importerApiUrl;
  }

  preview(transFormerCards: ConnectorCard[], config: ConnectorConfig, transformers: Map<string, FunctionsDetailDTO>, schemaId: string): Observable<Map<string, any[]>> {
    transFormerCards.forEach((card) => {
      const transformer = transformers.get(card.id!);
      if (transformer) {
        config.transformer = config.transformer || [];
        config.transformer.push(transformer);
      }
    });
    config.transformer = Array.from(transformers.values());


    const dto = configToPreviewDTO(config);
    dto.schema_id = schemaId;
    return this.apiService.post<PreviewResponseDTO>(`${this.getBaseUrl()}/preview/`, dto).pipe(
      map(response => {

        const transformedData = new Map<string, any[]>()
        response.jsons.forEach((jsonString, i) => {
          const json = JSON.parse(jsonString);
          const index = transFormerCards[i].id!;
          transformedData.set(index, json);
        });
        return transformedData;
      }),
    );
  }

  testValue(schemaId: string, value: any, path: string): Observable<any> {
    const params = new HttpParams()
      .set('schema_id', schemaId)
      .set('value', value)
      .set('path', path);

    return this.http.get<{ message: string }>(`${this.getBaseUrl()}/check_validations/`, {
      params
    }).pipe(
      catchError((err) => {
        return of(err.error as { message: string });
      }),
      map((response: { message: string }) => {
        return response.message;
      }),
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}
