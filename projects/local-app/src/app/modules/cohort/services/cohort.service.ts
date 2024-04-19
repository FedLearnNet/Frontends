import { Injectable } from '@angular/core';
import { Cohort, CohortPatient } from '@local-app/cohort/models';
import { concatMap, Observable, of, toArray } from 'rxjs';
import { COLORECTAL_CANCER_OPTIONS, QUERIABILITY_OPTIONS } from './mock';
import { SelectOption } from '@shared-lib/models';
import { PatientDataStatus } from '@local-app/cohort/enums';
import { generateRandomId, generateRandomUUID } from '@shared-lib/utils';
import { isEmpty } from 'lodash';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';
import { ApiService } from '@shared-lib/services/api.service';

@Injectable({
    providedIn: 'root'
})
export class CohortService {
    constructor(
        private apiService: ApiService,
    ) { }

    getCohorts(): Observable<CohortListItem[]> {
        return of([]);
    }

    getCohortById(id: number): Observable<Cohort> {
        return of();
    }

    getColorectalCancerOptions(): Observable<SelectOption[]> {
        return of(COLORECTAL_CANCER_OPTIONS);
    }

    getQueriabilityOptions(): Observable<SelectOption[]> {
        return of(QUERIABILITY_OPTIONS);
    }

    handleCohortCreation(cohortData: Cohort): Observable<any> {
        return this.createCohort(cohortData).pipe(concatMap((cohortCreationResponse: any) => {
            const cohort: Cohort = cohortCreationResponse.data?.addCohort?.cohort;

            return this.addPatientsToCohort(cohort.id, cohortData.patients).pipe(
                toArray(),
                concatMap(() => of([]))
            );
        }));
    }

    handleCohortUpdate(cohortData: Cohort): Observable<any> {
        return of([]);
    }

    handleDeleteCohort(cohortId: number): Observable<CohortListItem[]> {
        return of([]);
    }

    createPatient(patientData: CohortPatient, patients: CohortPatient[]): CohortPatient[] {
        patients.push({
            ...patientData,
            recordStatus: PatientDataStatus.CREATED
        });

        return patients;
    }

    updatePatient(patientData: CohortPatient, patients: CohortPatient[]): CohortPatient[] {
        return patients.map(patient => {
            if (patient.patientId !== patientData.patientId) {
                return patient;
            }

            return {
                ...patientData,
                recordStatus: patient.id ? PatientDataStatus.UPDATED : PatientDataStatus.CREATED,
            }
        });
    }

    deletePatient(id: number | null, patientId: number | null = null, patients: CohortPatient[]): CohortPatient[] {
        if (id === null) {
            return patients.filter(patient => patient.patientId !== patientId);
        }

        return patients.map(patient => {
            if (patient.patientId !== patientId) {
                return patient;
            }

            return { ...patient, recordStatus: PatientDataStatus.DELETED }
        });
    }

    private createCohort(cohortData: Cohort): Observable<[]> {
        return of([]);
    }

    private addPatientsToCohort(cohortId: number, patients: CohortPatient[]): Observable<any> {
        return of([]);
    }

    private buildPatientMutation(cohortId: number, patients: CohortPatient[], extraMutationString: string = '') {
        let mutations = '';

        patients.forEach((patient, index) => {
            mutations += this.getPatientRelatedMutation(cohortId, patient);
        });

        return `mutation { ${ extraMutationString } ${ mutations } }`;
    }

    private getPatientRelatedMutation(cohortId: number, patient: CohortPatient): string {
        switch (patient.recordStatus) {
            case PatientDataStatus.CREATED:
                return `patient_${ generateRandomId() }: ${ CohortService.getAddPatientMutationString(cohortId, patient) }`;
            case PatientDataStatus.UPDATED:
                return `patient_${ generateRandomId() }: ${ CohortService.getUpdatePatientMutationString(patient) }`;
            case PatientDataStatus.DELETED:
                return `patient_${ generateRandomId() }: ${ CohortService.getDeletePatientMutationString(patient) }`;
            default:
                return ``;
        }
    }

    private static getAddPatientMutationString(cohortId: number, patient: CohortPatient): string {
        return `
            addPatient(
                sex: "${ ['Female', 'Male'][Math.floor(Math.random() * 2)] }", 
                age: ${ patient.age }, 
                dietaryScore: ${ patient.dietaryScore }, 
                colorectalCancer: ${ patient.colorectalCancer },
                patientId: "${ patient.patientId }",
                cohortId: ${ cohortId }
            ) {
                patient {
                    id
                }
            }
      `;
    }

    private static getUpdatePatientMutationString(patient: CohortPatient): string {
        return `
            updatePatient(
                id: ${ patient.id },
                sex: "${ ['Female', 'Male'][Math.floor(Math.random() * 2)] }", 
                age: ${ patient.age }, 
                dietaryScore: ${ patient.dietaryScore }, 
                colorectalCancer: ${ patient.colorectalCancer },
                patientId: "${ patient.patientId }",
            ) {
                patient {
                    id
                }
            }
      `;
    }

    private static getDeletePatientMutationString(patient: CohortPatient): string {
        return `
            deletePatient(
                id: ${ patient.id },
            ) {
                ok
            }
      `;
    }

    private static getUpdateCohortMutationString(cohortData: Cohort): string {
        return `
            cohort: updateCohort(
                id: ${ cohortData.id }, 
                name: "${ cohortData.name }", 
                description: "${ cohortData.description }",
            ) {
                cohort {
                    id
                }
            }
      `;
    }

    private getCohortData(cohort: Cohort): Cohort {
        if (isEmpty(cohort?.patients)) return cohort;

        return {
            ...cohort,
            patients: cohort.patients.map(patient => {
                if (patient.patientId) return patient;

                return {
                    ...patient,
                    patientId: generateRandomUUID(),
                    recordStatus: PatientDataStatus.UPDATED,
                }
            })
        };
    }
}
