import {inject, Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {ConnectorFilesDetailDTO} from '../../connector/dto/upload-info';
import {HarmonizationDTO, HarmonizationResultDTO, HarmonizationTargetDTO} from '../dto/harmonization';

@Injectable({providedIn: 'root'})
export class HarmonizationService {
  private readonly apiService = inject(ApiService);
  private readonly url = `${environment.localLearningAPIURL}/harmonizations`;

  list(): Observable<HarmonizationDTO[]> {
    return this.apiService.get<HarmonizationDTO[]>(this.url);
  }

  get(id: number): Observable<HarmonizationDTO> {
    return this.apiService.get<HarmonizationDTO>(`${this.url}/${id}`);
  }

  save(harmonization: HarmonizationDTO): Observable<HarmonizationDTO> {
    return harmonization.id
      ? this.apiService.put<HarmonizationDTO>(`${this.url}/${harmonization.id}`, harmonization)
      : this.apiService.post<HarmonizationDTO>(this.url, harmonization);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.url}/${id}`);
  }

  targets(fileId: number, key: string): Observable<HarmonizationTargetDTO[]> {
    return this.apiService.get<HarmonizationTargetDTO[]>(`${this.url}/targets`,
      new HttpParams().set('fileId', fileId).set('key', key));
  }

  run(id: number): Observable<HarmonizationResultDTO> {
    return this.apiService.post<HarmonizationResultDTO>(`${this.url}/${id}/run`, {});
  }

  previewTransformed(harmonization: HarmonizationDTO, steps: number): Observable<Record<string, unknown>[]> {
    return this.apiService.post<Record<string, unknown>[]>(`${this.url}/preview`, harmonization, undefined,
      new HttpParams().set('steps', steps));
  }

  previewHarmonized(harmonization: HarmonizationDTO): Observable<HarmonizationResultDTO> {
    return this.apiService.post<HarmonizationResultDTO>(`${this.url}/preview/harmonized`, harmonization);
  }

  sample(fileId: number, rows = 10): Observable<Record<string, unknown>[]> {
    return this.apiService.get<Record<string, unknown>[]>(`${this.url}/files/${fileId}/sample`,
      new HttpParams().set('rows', rows));
  }

  files(): Observable<ConnectorFilesDetailDTO[]> {
    return this.apiService.get<ConnectorFilesDetailDTO[]>(`${this.url}/files`);
  }

  upload(file: File): Observable<ConnectorFilesDetailDTO> {
    const form = new FormData();
    form.append('file', file);
    return this.apiService.post<ConnectorFilesDetailDTO>(`${this.url}/files`, form);
  }

  download(fileId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.url}/files/${fileId}/download`);
  }

  assistantPath(id: number): string {
    return `/harmonizations/${id}/assistant`;
  }

  assistantRunning(id: number): Observable<boolean> {
    return this.apiService.get<boolean>(`${this.url}/${id}/assistant/running`);
  }
}
