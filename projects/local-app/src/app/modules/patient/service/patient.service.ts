import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {Observable} from 'rxjs';
import {PatientDto} from "../dto/patient";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.localLearningAPIURL;


  getPatient(cohortId: number, patientInternalId: number): Observable<PatientDto> {
    return this.apiService.get<PatientDto>(`${this.getBaseUrl(cohortId)}/${patientInternalId}`);
  }

  rollbackPatientData(cohortId: number, internalPatientId: number, revisionNumber: number, deleteAudit = false): Observable<PatientDto> {
    const httpParams = new HttpParams().set('delete_audit', deleteAudit);

    return this.apiService.put<PatientDto>(
      `${this.getBaseUrl(cohortId)}/${internalPatientId}/rollback/${revisionNumber}`,
      null,
      undefined,
      httpParams
    );
  }


  private getBaseUrl(cohortId: number): string {
    return `${this.apiUrl}/cohort/${cohortId}/data/patient`;
  }
}
