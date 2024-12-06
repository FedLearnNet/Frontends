import {Component, Input} from '@angular/core';
import {AppDto} from "@global-app/app-store/dto/app";
import {MatIconModule} from "@angular/material/icon";
import {UserLinkComponent} from "../../../user/components/user-link/user-link.component";
import {AppTagComponent} from "@global-app/app-store/components/app-tag/app-tag.component";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {CommonModule, DatePipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {AppRatingComponent} from "@global-app/app-store/components/app-rating/app-rating.component";

@Component({
  selector: 'app-app-header',
  standalone: true,
    imports: [MatIconModule,
        CommonModule,
        UserLinkComponent,
        AppTagComponent,
        DatePipe,
        MatButtonModule, RouterLink, AppRatingComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  @Input() app: AppDetailDto;
  @Input() linkToApp: boolean = false;
  @Input() showImg: boolean = true;

  versions: AppVersionDto[] = [];

  public getLastVersion(): AppVersionDto | undefined {
    if (this.versions.length === 0) {
      return undefined;
    }
    return this.versions.find(v => v.id === this.app.latestVersionId);
  }

}
