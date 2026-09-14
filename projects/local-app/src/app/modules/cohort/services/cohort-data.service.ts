import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {Observable, of} from 'rxjs';
import {buildQueryString} from '@shared-lib/utils';
import {PaginatedResponse} from '@shared-lib/models';
import {PatientRequest} from '@local-app/cohort/models';
import {PatientDataEntryCreateDto, PatientDataEntryDto} from "../../patient/dto/patient";

@Injectable({
  providedIn: 'root'
})
export class CohortDataService {
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'patient'

  getAllCohortData(cohortId: number | null, page: number | null = null, pageSize: number | null = null): Observable<PaginatedResponse<any>> {
    if (!cohortId) return of();

    return this.apiService.get<PaginatedResponse<any>>(`${this.getBaseUrl(cohortId)}/reduced?nonNumericReduction=latest&numericReduction=latest&${buildQueryString({
      page: page,
      page_size: pageSize
    })}`);
  }

  getCohortData(cohortId: number, dataId: string): Observable<any> {
    return this.apiService.get<any>(`${this.getBaseUrl(cohortId)}/${dataId}`);
  }

  createNewPatient(patientData: PatientRequest): Observable<any> {
    return this.apiService.post<any>(`${this.getBaseUrl(patientData.cohortId)}`, patientData);
  }

  updatePatient(patientData: PatientRequest): Observable<any> {
    return this.apiService.put<any>(`${this.getBaseUrl(patientData.cohortId)}/${patientData.internalPatientId}/dataentry/bulk`, patientData.dataEntries);
  }

  deleteCohortData(cohortId: number, dataId: string, _deleteTraceLogs: boolean = false): Observable<any> {
    // @TODO Currently, we only have soft delete, so hard deletion is not yet supported in the local-learning-api
    // return this.apiService.delete<any>(`${this.getBaseUrl(cohortId)}/${dataId}/?${buildQueryString({delete_trace_logs: deleteTraceLogs})}`);
    return this.apiService.delete<any>(`${this.getBaseUrl(cohortId)}/${dataId}`);
  }


  //For single changes

  updatePatientDataEntry(cohortId: number, patientId: number, patientData: PatientDataEntryDto): Observable<PatientDataEntryDto> {
    return this.apiService.put<PatientDataEntryDto>(`${this.getBaseUrl(cohortId)}/${patientId}/dataentry/${patientData.id}`, patientData);
  }

  createPatientDataEntry(cohortId: number, patientId: number, patientData: PatientDataEntryCreateDto): Observable<PatientDataEntryDto> {
    return this.apiService.post<PatientDataEntryDto>(`${this.getBaseUrl(cohortId)}/${patientId}/dataentry`, patientData);
  }

  deletePatientDataEntry(cohortId: number, patientId: number, dataId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getBaseUrl(cohortId)}/${patientId}/dataentry/${dataId}`);
  }


  private getBaseUrl(cohortId: number): string {
    return `${this.apiUrl}/cohort/${cohortId}/data/${this.path}`;
  }
}
