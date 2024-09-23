import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { SMALL } from '@shared-lib/constants';
import { Schema } from '@shared-lib/models';

@Component({
  selector: 'app-cohort-overview',
  templateUrl: './cohort-overview.component.html',
  styleUrl: './cohort-overview.component.scss',
})
export class CohortOverviewComponent implements OnInit {
  selectedTabIndex: number = 0;
  isLargeScreen: boolean = true;

  schema: Schema = {} as Schema;

  constructor(
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({schema}) => this.schema = cloneDeep(schema));

    this.activatedRoute.fragment.subscribe(fragment => {
      this.selectedTabIndex = fragment === 'Patients' ? 1 : 0;
    });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .isScreenSizeGreaterThan(SMALL)
        .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);
  }
}
