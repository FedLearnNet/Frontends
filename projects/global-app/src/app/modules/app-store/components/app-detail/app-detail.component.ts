import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatTabsModule} from "@angular/material/tabs";
import {ActivatedRoute, RouterLink,} from "@angular/router";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule, DatePipe, Location} from '@angular/common';
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatToolbar} from "@angular/material/toolbar";
import {UserLinkComponent} from "../../../user/components/user-link/user-link.component";
import {AppHeaderComponent} from "@global-app/app-store/components/app-header/app-header.component";
import {AppVersionListComponent} from "@global-app/app-store/components/app-version-list/app-version-list.component";
import {AppDetailConfigComponent} from "../../../test-app/components/app-detail-config/app-detail-config.component";
import {AppConfigComponent} from "@global-app/app-store/components/app-config/app-config.component";
import {AppReviewsComponent} from "@global-app/app-store/components/app-reviews/app-reviews.component";


@Component({
  selector: 'app-app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    AppTagComponent,
    MatIconModule,
    DatePipe,
    RouterLink,
    MarkdownComponent,
    MatToolbar,
    UserLinkComponent,
    AppHeaderComponent,
    AppVersionListComponent,
    AppDetailConfigComponent,
    AppConfigComponent,
    AppReviewsComponent
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail.component.html',
  styleUrl: './app-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDetailComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly location: Location = inject(Location);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  app?: AppDetailDto;
  ratings: number[] = [1, 2, 3, 4, 5];
  versions: AppVersionDto[] = [];

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({app}) => {
      this.app = app;
      this.cdr.detectChanges();
    });
  }

  public getLastVersion(): AppVersionDto | undefined {
    if (this.versions.length === 0) {
      return undefined;
    }
    return this.versions[0];
  }

  public backClicked(): void {
    this.location.back();
  }

  versionChanged(version: AppVersionDto): void {
    if(!this.app) {
      return;
    }
    this.app.appConfig = version.appConfig;
    this.app.shortDescription = version.shortDescription;
    this.app.longDescription = version.longDescription;
    this.app.imageName = version.imageName;
    this.app.latestVersion = version.appVersion;
    this.app.latestVersionId = version.id;
    this.app.certificationLevel = version.certificationLevel;
    if(version.imageName) {
      this.app.hasImage = true;
    }
    this.cdr.detectChanges();
  }


}
