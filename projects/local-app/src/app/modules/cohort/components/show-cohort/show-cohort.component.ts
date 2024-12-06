import { Component, ViewChild, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { Cohort, CohortPatient } from '@local-app/cohort/models';

@Component({
  selector: 'app-show-cohort',
  templateUrl: './show-cohort.component.html',
  styleUrl: './show-cohort.component.scss',
})
export class ShowCohortComponent implements OnInit {
  selectedStepIndex: number = 0;
  cohort: Cohort = {} as Cohort;
  cohortPatients: CohortPatient[] = [];

  cohortDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  cohortQueriabilityForm = this.formBuilder.group({
    files: [''],
    dietaryScore: [''],
    colorectalCancer: [''],
  });

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      private cohortService: CohortService,
      private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({cohort}) => this.loadCohortDetail(cohort));

    this.cohortDetailForm.disable();
    this.cohortQueriabilityForm.disable();
  }

  loadCohortDetail(cohort: Cohort): void {
    this.cohort = cohort;

    this.cohortDetailForm.patchValue({
      name: this.cohort?.name,
      description: this.cohort?.description,
    });

    this.cohortQueriabilityForm.patchValue({
      files: this.cohort?.queriability?.files ?? null,
      dietaryScore: this.cohort?.queriability?.dietaryScore ?? null,
      colorectalCancer: this.cohort?.queriability?.colorectalCancer ?? null,
    });

    this.cohortPatients = this.cohort?.patients ?? [];
  }

  getCohortName() {
    if (this.cohort.name && (this.stepper && this.stepper.selectedIndex !== 0)) {
      return `Cohort: <b>${this.cohort.name}</b>`;
    }

    return 'Cohort';
  }

  closeCohort(): void {
    this.router.navigate(['cohort']);
  }
}
