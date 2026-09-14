import {Component, inject, OnInit, signal} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {AppService} from "../../../../service/app.service";
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {AppDetailConfigElementComponent} from "../app-detail-config-element/app-detail-config-element.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";

@Component({
  selector: 'app-app-config-remote-config-selection-dialog',
  imports: [
    CloseableDialogTitleComponent,
    SkeletonLoaderComponent,
    AppDetailConfigElementComponent,
    HintCardComponent,
    MatDialogContent
  ],
  templateUrl: './app-config-remote-config-selection-dialog.component.html',
  styleUrl: './app-config-remote-config-selection-dialog.component.scss',
})
export class AppConfigRemoteConfigSelectionDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppConfigRemoteConfigSelectionDialogComponent>);
  private readonly apiService: AppService = inject(AppService);

  loading = signal<boolean>(true);
  configs = signal<ToolConfigDTO[]>([]);

  ngOnInit(): void {
    this.apiService.getPredefinedConfig()
      .subscribe({
        next: (configs) => {
          this.configs.set(configs);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  select(config: ToolConfigDTO) {
    this.dialogRef.close(config);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }


}
