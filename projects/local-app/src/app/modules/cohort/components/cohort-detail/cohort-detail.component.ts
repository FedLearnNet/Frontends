import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ResponsiveService } from '@shared-lib/services/responsive.service';

@Component({
  selector: 'app-cohort-detail',
  templateUrl: './cohort-detail.component.html',
  styleUrl: './cohort-detail.component.scss'
})
export class CohortDetailComponent {
  @Input() cohortDetailFormGroup: FormGroup;

  screenSize: string;

  constructor(
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.responsiveService.getScreenSize().subscribe(screenSize => this.screenSize = screenSize);
  }
}
