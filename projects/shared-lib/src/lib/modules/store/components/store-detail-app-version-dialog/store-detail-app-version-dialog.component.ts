import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  StoreAppConfigComponent
} from "@shared-lib/modules/store/components/store-app-config/store-app-config.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MatDivider} from "@angular/material/divider";

interface AppDetail {
  app: AppDetailDto;
  version: AppVersionDto;
}


@Component({
  selector: 'lib-store-detail-app-version-dialog',
  imports: [
    MarkdownComponent,
    MatDialogContent,
    MatTab,
    MatTabGroup,
    StoreAppConfigComponent,
    TranslatePipe,
    MatDivider,
    CloseableDialogTitleComponent
  ],
  templateUrl: './store-detail-app-version-dialog.component.html',
  styleUrl: './store-detail-app-version-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideMarkdown(),
  ]
})
export class StoreDetailAppVersionDialogComponent {
  private readonly dialogRef: MatDialogRef<StoreDetailAppVersionDialogComponent> = inject(MatDialogRef);

  readonly data = inject<AppDetail>(MAT_DIALOG_DATA);


  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  getDialogTitle() {
    return this.data.app.name + " (" + this.data.version.appVersion + ")";
  }
}
