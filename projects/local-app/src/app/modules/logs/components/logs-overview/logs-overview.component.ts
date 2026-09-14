import {Component, inject, OnInit} from '@angular/core';
import {MatTabChangeEvent, MatTabsModule} from "@angular/material/tabs";
import {ActivatedRoute, Router} from "@angular/router";
import {PatientUpdateLogComponent} from "../patient-update-log/patient-update-log.component";
import {PatientQueryLogComponent} from "../patient-query-log/patient-query-log.component";
import {PatientLearningLogComponent} from "../patient-learning-log/patient-learning-log.component";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {StatisticsAccessLogComponent} from "../statistics-access-log/statistics-access-log.component";

@Component({
  selector: 'app-logs-overview',
  imports: [
    MatTabsModule,
    PatientUpdateLogComponent,
    PatientQueryLogComponent,
    PatientLearningLogComponent,
    StatisticsAccessLogComponent,
    TranslatePipe,
  ],
  templateUrl: './logs-overview.component.html',
  styleUrl: './logs-overview.component.scss'
})
export class LogsOverviewComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);

  public selectedIndex: number = 0;


  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setFallbackLang(savedLang);
    this.translate.use(savedLang);

    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex = tabIndex;
      }
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    const fragments = ['patient-update', 'query-access', 'training-access', 'statistics-access'];
    this.router.navigate([], {
      fragment: fragments[event.index],
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
      case 'statistics-access':
        return 3;
      default:
        return 0;
    }
  }
}
