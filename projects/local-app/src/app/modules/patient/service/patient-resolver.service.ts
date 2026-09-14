import {ActivatedRouteSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {PatientService} from "./patient.service";

export const patientResolver = (route: ActivatedRouteSnapshot) => {
  const svc = inject(PatientService);
  const cohortId  = Number(route.paramMap.get('cohortId'));
  const patientId = Number(route.paramMap.get('patientId'));
  return svc.getPatient(cohortId, patientId);
};
