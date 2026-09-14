import {Component, computed, inject, model, OnInit, output, signal} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {ModelDetailDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {
  ModelVersionDetailDialogComponent
} from "@global-app/model-store/components/model-version-detail-dialog/model-version-detail-dialog.component";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {ModelPublishStatus} from "@global-app/model-store/dto/model-status";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";
import {
  StoreDetailAppVersionDialogComponent
} from "@shared-lib/modules/store/components/store-detail-app-version-dialog/store-detail-app-version-dialog.component";
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from "@shared-lib/components/markdown-dialog/markdown-dialog.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

interface StoreVersion {
  version: string;
  createdAt: Date;
  changelog: string;
  publishStatus: ModelPublishStatus | PublishStatus;
  imageName?: string;
  selected: boolean;
  data: AppVersionDto | ModelVersionDto;
}

@Component({
  selector: 'lib-store-version-list',
  imports: [
    MatIcon,
    MatIconButton,
    MatMenuModule,
    MatTableModule,
    TranslatePipe,
    PublishBadgeComponent,
    BadgeComponent,
    DockerImageTagComponent,
    TimeBadgeComponent,
  ],
  templateUrl: './store-version-list.component.html',
  styleUrl: './store-version-list.component.scss'
})
export class StoreVersionListComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);

  detail = model.required<AppDetailDto | ModelDetailDto | undefined>();
  selectedVersion = output<AppVersionDto | ModelVersionDto>();

  displayedColumns: string[] = ['version', 'createdAt', 'publishStatus', 'changelog', 'actions'];

  detailView = signal<boolean>(false);

  ngOnInit(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }
    if ('createdByUser' in detail && detail.createdByUser) {
      this.displayedColumns = ['version', 'createdAt', 'publishStatus', 'imageName', 'changelog', 'actions'];
      this.detailView.set(true);
    }
  }

  versions = computed(() => {
    const detail = this.detail();
    if (!detail) {
      return [];
    }
    if ('modelVersions' in detail) {
      return (detail.modelVersions?.map(v => {
        return {
          version: v.modelVersion,
          createdAt: v.createdAt,
          changelog: v.changelog,
          publishStatus: v.publishStatus,
          imageName: v.selectedSubModel?.imageName,
          selected: v.id === (detail as ModelDetailDto).lastVersion?.id,
          data: v,
        } as StoreVersion;
      }) ?? []).sort((a, b) => (b.data.id ?? 0) - (a.data.id ?? 0));
    }
    return ((detail as AppDetailDto).versions?.map(v => {
      return {
        version: v.appVersion,
        createdAt: v.createdAt,
        changelog: v.changelog,
        publishStatus: v.versionPublishStatus,
        imageName: v.imageName,
        selected: v.id === (detail as AppDetailDto).latestVersionId,
        data: v,
      } as StoreVersion;
    }) ?? []).sort((a, b) => (b.data.id ?? 0) - (a.data.id ?? 0));
  })

  openVersion(version: StoreVersion): void {
    if (!this.detail()) {
      return;
    }
    if ('modelId' in (version.data)) {
      this.openVersionModel(version.data);
      return;
    }
    this.openVersionApp(version.data as AppVersionDto);
  }

  openVersionModel(version: ModelVersionDto): void {
    const model = this.detail() as ModelDetailDto;

    const dialogRef = this.dialog.open(ModelVersionDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {model: model, version: version},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && model.modelVersions) {
        this.detail.update((model) => {
          if (!model) {
            return model;
          }
          (model as ModelDetailDto).modelVersions = (model as ModelDetailDto).modelVersions!.map(v => v.id === result.id ? result : v);
          (model as ModelDetailDto).lastVersion = result;
        });
      }
    });
  }

  openVersionApp(version: AppVersionDto): void {
    const app = this.detail() as AppDetailDto;
    const dialogRef = this.dialog.open(StoreDetailAppVersionDialogComponent, {
      data: {app: app, version: version},
      width: '900px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && app.versions) {
        this.detail.update((app) => {
          if (!app) {
            return app;
          }
          (app as AppDetailDto).versions = (app as AppDetailDto).versions.map((v: AppVersionDto) => v.id === result.id ? result : v);
          return app;
        });
      }
    });
  }


  useSpecificVersion(version: StoreVersion) {
    const current = this.detail();
    if (!current) {
      return;
    }

    if ('modelId' in (version.data)) {
      this.detail.update(prev => {
        if (!prev) return prev;
        const m = prev as ModelDetailDto;
        return {
          ...m,
          lastVersion: version.data as ModelVersionDto,
        };
      });
    } else {
      const v = version.data as AppVersionDto;
      this.detail.update(prev => {
        if (!prev) return prev;
        const a = prev as AppDetailDto;
        return {
          ...a,
          appConfig: v.appConfig ?? a.appConfig,
          shortDescription: v.shortDescription,
          longDescription: v.longDescription,
          imageName: v.imageName,
          latestVersion: v.appVersion,
          latestVersionId: v.id,
          certificationLevel: v.certificationLevel,
          hasImage: !!v.imageName,
          audits: v.audits
        };
      });
    }

    this.selectedVersion.emit(version.data);
  }

  showRawJSON(version: StoreVersion) {
    const current = this.detail();
    if (!current) {
      return;
    }
    const jsonString = 'modelId' in (version.data) ?
      JSON.stringify({...current, modelVersions: [version.data]}, null, 2) :
      JSON.stringify({...current, versions: [version.data]}, null, 2)

    const markdownJson = "```json\n" + jsonString + "\n```";

    this.dialog.open(MarkdownDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        title: current.name + " (" + version.version + ")  JSON",
        markdown: markdownJson,
        copyToClipboard: true
      } as MarkdownDialogData,
    });
  }

}
