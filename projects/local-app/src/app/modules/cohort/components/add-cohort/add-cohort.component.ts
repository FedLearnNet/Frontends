import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { SMALL } from '@shared-lib/constants';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { Cohort, CohortPatient } from '@local-app/cohort/models';

@Component({
  selector: 'app-add-cohort',
  templateUrl: './add-cohort.component.html',
  styleUrl: './add-cohort.component.scss',
})
export class AddCohortComponent implements OnInit {
  isLargeScreen: boolean = true;
  cohort: Cohort = {} as Cohort;
  cohortPatients: CohortPatient[] = [];

  cohortDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  patientsForm = this.formBuilder.group({
    patients: [[], Validators.required],
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
      private responsiveService: ResponsiveService,
  ) {}

  ngOnInit(): void {
    const cohortId = this.activatedRoute.snapshot.params['cohort-id'];

    this.activatedRoute.data.subscribe(({cohort}) =>this.loadCohortDetail(cohort));

    if (cohortId) {
      setTimeout(() => (this.stepper.selectedIndex = 1), 0);
    }

    this.checkAndAdjustResponsiveLayout();
  }

  loadCohortDetail(cohort: Cohort): void {
    this.cohort = cloneDeep(cohort);

    this.cohortDetailForm.patchValue({
      name: this.cohort?.name,
      description: this.cohort?.description,
    });

    this.cohortQueriabilityForm.patchValue({
      files: this.cohort?.queriability?.files ?? null,
      dietaryScore: this.cohort?.queriability?.dietaryScore ?? null,
      colorectalCancer: this.cohort?.queriability?.colorectalCancer ?? null,
    })

    this.cohortPatients = cloneDeep(this.cohort?.patients ?? []);
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .isScreenSizeGreaterThan(SMALL)
        .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);
  }

  getCohortName() {
    if (this.cohortDetailForm.get('name') && (this.stepper && this.stepper.selectedIndex !== 0)) {
      return `Cohort: <b>${this.cohortDetailForm.get('name')?.value}</b>`;
    }

    return 'Cohort';
  }

  isAddPatientStepCompleted(): boolean {
    return this.cohortPatients?.length > 0 && this.cohortQueriabilityForm.valid;
  }

  async submitCohort(): Promise<void> {
    const cohortData = {
      ...this.cohortDetailForm.getRawValue(),
      patients: this.cohortPatients,
      queriability: this.cohortQueriabilityForm.getRawValue()
    } as Cohort;

    if (this.cohort?.id) {
      await this.cohortService.handleCohortUpdate({...cohortData, id: this.cohort.id }).subscribe(() => {
        this.router.navigate(['cohort']);
      });
    } else {
      await this.cohortService.handleCohortCreation(cohortData).subscribe(() => {
        this.router.navigate(['cohort']);
      });
    }
  }

  onStepChange(selectionEvent: StepperSelectionEvent): void {
    this.cohortQueriabilityForm = cloneDeep(this.cohortQueriabilityForm);

    if (selectionEvent.selectedIndex === 2) {
      this.cohortQueriabilityForm.disable();
    }

    if (selectionEvent.previouslySelectedIndex === 2) {
      this.cohortQueriabilityForm.enable();
    }
  }
}
