import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';

@Component({
  selector: 'app-model-store-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class ModelStoreDashboardComponent {
    screenSize: string = 'lg';
    selectedTabIndex = new FormControl(0);
    eventSubject: Subject<{}> = new Subject<{}>();

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
