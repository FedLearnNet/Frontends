import {Component, inject, Input, OnInit} from '@angular/core';
import {MatTab, MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {ActivatedRoute, Router} from "@angular/router";
import {AppDetailConfigComponent} from "../app-detail-config/app-detail-config.component";
import {AppDetailSetupComponent} from "../app-detail-setup/app-detail-setup.component";
import {ControllerSocketService} from "../../service/testembed-socket.service";
import { environment } from '@global-app/env/environment';

import {EMPTY, Observable, tap} from "rxjs";
import {ClientConfigDTO, ConfigPydanticDTO} from "../../dto/config";
import {AsyncPipe, CommonModule} from "@angular/common";
import {
  AppDetailMonitorComponent
} from "../app-detail-config/components/app-detail-monitor/app-detail-monitor.component";
import {PerformanceDTO} from "../../dto/performance";
import {AppRunsComponent} from "../app-runs/app-runs.component";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {AppService} from "@global-app/app-store/service/app.service";
import {MatIconModule} from "@angular/material/icon";
import {AppConsoleLogComponent} from "../app-detail-config/components/app-console-log/app-console-log.component";
import {ExperimentHeaderComponent} from "../experiment/experiment-header/experiment-header.component";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MyModelListComponent} from "@global-app/model-store/components/my-model-list/my-model-list.component";

@Component({
  selector: 'app-app-detail',
  standalone: true,
  imports: [
    MatTabsModule,
    AppDetailConfigComponent,
    AppDetailSetupComponent,
    CommonModule,
    AppDetailMonitorComponent,
    AppRunsComponent,
    MatIconModule,
    AppConsoleLogComponent,
    ExperimentHeaderComponent,
    SharedLibModule,
    MyModelListComponent
  ],
  templateUrl: './app-detail.component.html',
  styleUrl: './app-detail.component.scss'
})
export class AppDetailComponent implements OnInit {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly controllerSocketService: ControllerSocketService = inject(ControllerSocketService)
  private readonly appService: AppService = inject(AppService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  public selectedIndex: number = 0;
  public connected: boolean = false;
  public appConnected: boolean = false;

  public app?: AppDetailDto;
  public configPydantic?: ConfigPydanticDTO;
  public clientConfig?: ClientConfigDTO;
  public datafiles: string[] = [];

  ngOnInit(): void {

    this.activatedRoute.data.subscribe(({app}) => {
      this.app = app;
      this.appService.getAppPydantic(this.app!.id, this.app?.latestVersionId).subscribe(config => {
        this.configPydantic = config;
      });
      this.controllerSocketService.connectToWebSocket(`${environment.globalDBApiWSUrl}/testembed/${this.app!.id}/client`);

    });

    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex = tabIndex;
      }
    });


    this.controllerSocketService.isConnected$.subscribe(connected => {
      this.connected = connected;
    });
    this.controllerSocketService.getServerError$().subscribe(error => {
      this.snackBar.open(error, 'Close', {duration: 3000});
    });
    this.controllerSocketService.getAppConfig$().subscribe(config => {
      this.app = config;
    });
    this.controllerSocketService.getAppConfigPydantic$().subscribe(config => {
      this.configPydantic = config;
    });
    this.controllerSocketService.isAppConnected$().subscribe(connected => {
        this.appConnected = connected;
    });

    this.controllerSocketService.isAppConnected$().subscribe(connected => {
      this.appConnected = connected;
    });
    this.controllerSocketService.getClientConfig$().subscribe(config => {
      this.clientConfig = config;
    });

    this.controllerSocketService.getDatafiles$().subscribe(datafiles => {
      this.datafiles = datafiles;
    });
  }

  getPerformance$(): Observable<PerformanceDTO> {
    return this.controllerSocketService.getPerformance$();
  }



  configChanged(config: AppDetailDto) {
    if (config) {
      this.app = config;
      this.controllerSocketService.saveAppConfig(this.app);
    }
  }

  onTabChange(event: any): void {
    const selectedTabLabel = event.tab.textLabel;
    this.router.navigate([], {
      fragment: selectedTabLabel.toLowerCase(),
    });
  }

  getTabIndexFromHash(hash: string | null): number {
    switch (hash) {
      case 'overview':
        return 0;
      case 'runs':
        return 1;
      case 'monitor':
        return 2;
      case 'setup':
        return 3;
      case 'models':
        return 4;
      default:
        return 0;
    }
  }

}
