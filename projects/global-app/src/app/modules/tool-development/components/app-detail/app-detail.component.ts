import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {ActivatedRoute, Router} from "@angular/router";
import {AppDetailConfigComponent} from "../app-detail-config/app-detail-config.component";
import {ControllerSocketService} from "../../service/testembed-socket.service";

import {Observable} from "rxjs";
import {ClientConfigDTO, ConfigPydanticDTO} from "../../dto/config";
import {CommonModule} from "@angular/common";
import {PerformanceDTO} from "../../dto/performance";
import {AppRunsComponent} from "../app-runs/app-runs.component";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {AppService} from "../../service/app.service";
import {MatIconModule} from "@angular/material/icon";
import {AppConsoleLogComponent} from "../app-detail-config/components/app-console-log/app-console-log.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MyModelListComponent} from "@global-app/model-store/components/my-model-list/my-model-list.component";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {PipelineListComponent} from "../../../pipeline/components/pipeline-list/pipeline-list.component";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {AppGenerateStartupCodeComponent} from "../app-generate-startup-code/app-generate-startup-code.component";
import {MatDialog} from "@angular/material/dialog";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {loadFiles} from "@shared-lib/modules/files/store/file.actions";
import {Store} from "@ngrx/store";
import {AppTypeBadgeComponent} from "@shared-lib/modules/store/components/app-type-badge/app-type-badge.component";
import {TOOL_TYPE_CONFIG_DEFAULT_OPTIONS, TOOL_TYPE_CONFIG_MAP} from "../../model/tool-config-type";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {getConfigWSUrl} from "@global-app/utils/ws-url-helper";


@Component({
  selector: 'app-app-detail',
  imports: [
    MatTabsModule,
    AppDetailConfigComponent,
    CommonModule,
    AppRunsComponent,
    MatIconModule,
    AppConsoleLogComponent,
    MyModelListComponent,
    TranslatePipe,
    MatButton,
    MatTooltip,
    PipelineListComponent,
    StoreVersionListComponent,
    SkeletonLoaderComponent,
    AppTypeBadgeComponent,
    ErrorCardComponent,
    HeaderComponent,
  ],
  templateUrl: './app-detail.component.html',
  styleUrl: './app-detail.component.scss'
})
export class AppDetailComponent implements OnInit {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly controllerSocketService: ControllerSocketService = inject(ControllerSocketService)
  private readonly appService: AppService = inject(AppService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly store: Store = inject(Store);

  readonly selectedIndex = signal<number>(0);
  public connected = toSignal(this.controllerSocketService.isConnected$, {initialValue: false});
  public appConnected = signal<boolean>(false);

  public readonly app = signal<AppDetailDto | undefined>(undefined);
  public readonly configPydantic = signal<ConfigPydanticDTO | undefined>(undefined);

  readonly toolConfigOptions = computed(() => {
    if (this.app()?.type === undefined) return TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
    return TOOL_TYPE_CONFIG_MAP[this.app()!.type!] ?? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
  });

  readonly supportsTraining = computed(() => {
    return this.toolConfigOptions().supportsTraining;
  });

  public clientConfig = signal<ClientConfigDTO>({} as ClientConfigDTO);
  public datafiles = signal<LocalFiles[]>([]);

  ngOnInit(): void {

    this.store.dispatch(loadFiles());
    this.activatedRoute.data.subscribe(({app}) => {
      this.app.set(app);
      this.appService.getAppPydantic(app!.id, app?.latestVersionId).subscribe(config => {
        this.configPydantic.set(config);
      });

      this.controllerSocketService.connectToWebSocket(`${getConfigWSUrl()}/testembed/${app!.id}/client`);

    });

    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex.set(tabIndex);
      }
    });
    this.controllerSocketService.getServerError$().subscribe(error => {
      this.snackBar.open(error, this.translate.instant('BUTTON.CLOSE'), {duration: 3000});
    });
    this.controllerSocketService.getAppConfig$().subscribe(config => {
      this.app.set(config);
    });
    this.controllerSocketService.getAppConfigPydantic$().subscribe(config => {
      this.configPydantic.set(config);
    });

    this.controllerSocketService.isAppConnected$().subscribe(isAppConnected => {
      this.appConnected.set(isAppConnected);
    });

    this.controllerSocketService.getDatafiles$().subscribe(datafiles => {
      this.datafiles.set(datafiles);
    });

    this.controllerSocketService.getClientConfig$().subscribe(clientConfig => {
      this.clientConfig.set(clientConfig);
    });

  }

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
    this.router.navigate([], {
      fragment: this.getHashFromTabIndex(index),
    });
  }

  getPerformance$(): Observable<PerformanceDTO> {
    return this.controllerSocketService.getPerformance$();
  }

  configChangedVersion(config?: any) {
    if (config) {
      this.appChanged(config);
    }
  }

  appChanged(app?: AppDetailDto) {
    if (app) {
      this.app.set(app);
      this.controllerSocketService.saveAppConfig(this.app()!);
    }
  }

  getTabIndexFromHash(hash: string | null): number {
    switch (hash) {
      case 'overview':
        return 0;
      case 'runs':
        return 1;
      case 'models':
        return 2;
      case 'pipelines':
        return 3;
      case 'versions':
        return 4;
      default:
        return 0;
    }
  }

  getHashFromTabIndex(index: number): string {
    switch (index) {
      case 0:
        return 'overview';
      case 1:
        return 'runs';
      case 2:
        return 'models';
      case 3:
        return 'pipelines';
      case 4:
        return 'versions';
      default:
        return 'overview';
    }
  }

  async copyAppId() {
    if (!this.app() || !this.app()!.id) return;
    await navigator.clipboard.writeText("" + this.app()!.id);
    this.snackBar.open('App ID copied to clipboard', 'Close', {duration: 2000});
  }

  openStartupGeneratorCode() {
    this.dialog.open(AppGenerateStartupCodeComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: this.app()
    });
  }

  onGoBack(): void {
    this.router.navigate(['/app']);
  }
}
