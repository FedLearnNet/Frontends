import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';

@Component({
  selector: 'app-model-store-dashboard',
  templateUrl: './model-store-dashboard.component.html',
  styleUrl: './model-store-dashboard.component.scss',
})
export class ModelStoreDashboardComponent implements OnInit {
  screenSize: string = 'lg';
  selectedTabIndex = new FormControl(0);
  eventSubject: Subject<object> = new Subject<object>();

  constructor(
    private router: Router,
    private responsiveService: ResponsiveService,
  ) {
    if (this.router.getCurrentNavigation()?.extras.state?.['toPrediction']) {
      this.selectedTabIndex.setValue(1);
    }
  }

  ngOnInit(): void {
    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => this.screenSize = screenSize);
  }

  onFilterChange(event: any): void {
    this.eventSubject.next(event);
  }
}
