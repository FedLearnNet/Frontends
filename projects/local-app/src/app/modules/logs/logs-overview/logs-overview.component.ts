import {Component, inject, OnInit} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "@global-app/env/environment";
import {PatientUpdateLogComponent} from "../patient-update-log/patient-update-log.component";
import {PatientQueryLogComponent} from "../patient-query-log/patient-query-log.component";
import {PatientLearningLogComponent} from "../patient-learning-log/patient-learning-log.component";

@Component({
  selector: 'app-logs-overview',
  standalone: true,
  imports: [MatTabsModule, PatientUpdateLogComponent, PatientQueryLogComponent, PatientLearningLogComponent],
  templateUrl: './logs-overview.component.html',
  styleUrl: './logs-overview.component.scss'
})
export class LogsOverviewComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  public selectedIndex: number = 0;


  ngOnInit(): void {

    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex = tabIndex;
      }
    });
  }

  onTabChange(event: any): void {
    const selectedTabLabel = event.tab.textLabel;
    this.router.navigate([], {
      fragment: selectedTabLabel.toLowerCase().replaceAll(' ', '-'),
    });
  }

  getTabIndexFromHash(hash: string | null): number {
    switch (hash) {
      case 'patient-update':
        return 0;
      case 'query-access':
        return 1;
      case 'training-access':
        return 2;
      default:
        return 0;
    }
  }
}
