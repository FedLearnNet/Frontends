import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {MatButtonModule} from "@angular/material/button";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {AppConfigComponent} from "@global-app/app-store/components/app-config/app-config.component";
import {AppVersionListComponent} from "@global-app/app-store/components/app-version-list/app-version-list.component";
import {MatTab, MatTabGroup, MatTabsModule} from "@angular/material/tabs";


interface AppDetail {
  app: AppDetailDto;
  version: AppVersionDto;
}

@Component({
  selector: 'app-app-version-detail',
  standalone: true,
  imports: [CommonModule,
    MatDialogModule, MatButtonModule,
    MarkdownComponent, AppConfigComponent, MatTabsModule],
  templateUrl: './app-version-detail.component.html',
  styleUrl: './app-version-detail.component.scss',
  providers: [
    provideMarkdown(),
  ],
})
export class AppVersionDetailComponent {
  private readonly dialogRef: MatDialogRef<AppVersionDetailComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly data = inject<AppDetail>(MAT_DIALOG_DATA);
}
