import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModelService } from '../../services/model.service';
import { Model } from '../../models';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { LARGE } from '@shared-lib/constants';

@Component({
  selector: 'app-model-detail',
  templateUrl: './model-detail.component.html',
  styleUrl: './model-detail.component.scss',
})
export class ModelDetailComponent implements OnInit {
  model: Model;
  screenSize: string = LARGE;

  filesForm = this.formBuilder.group({
    files: [[]],
  });

  constructor(
      private router: Router,
      private location: Location,
      private formBuilder: FormBuilder,
      private modelService: ModelService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({model}) => this.model = model);

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.screenSize = screenSize);
  }

  onGoBack(): void {
    this.location.back();
  }

  filesChanged(event: any): void {
    this.filesForm.patchValue({files: event});
  }

  onPredict(): void {
    if (!this.hasInputFiles()) return;

    this.modelService.predictUsingModel(this.model.id, this.filesForm.getRawValue().files).subscribe(result => {
      if (!result) return;

      this.router.navigate(['model-store'], { state: { toPrediction: true } });
    });
  }

  hasInputFiles(): boolean {
    const files = this.filesForm.getRawValue()?.files ?? [];

    return files.length !== 0;
  }
}
