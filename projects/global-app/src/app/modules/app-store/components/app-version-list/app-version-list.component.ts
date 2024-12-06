import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {
  AppVersionDetailComponent
} from "@global-app/app-store/components/app-version-detail/app-version-detail.component";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";

@Component({
  selector: 'app-app-version-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatMenuModule
  ],
  templateUrl: './app-version-list.component.html',
  styleUrl: './app-version-list.component.scss'
})
export class AppVersionListComponent {
  private readonly dialog: MatDialog = inject(MatDialog);

  @Input() app: AppDetailDto;
  @Output() selectedVersion: EventEmitter<AppVersionDto> = new EventEmitter<AppVersionDto>();

  displayedColumns: string[] = ['version', 'createdAt', 'changelog', 'actions'];

  useSpecificVersion(version: AppVersionDto) {
    this.selectedVersion.emit(version);
  }

  isSelectedVersion(version: AppVersionDto): boolean {
    return (!!this.app.latestVersion) && version.id === this.app.latestVersionId;
  }

  openVersion(version: AppVersionDto): void {
    const dialogRef = this.dialog.open(AppVersionDetailComponent, {
      data: {app: this.app, version: version},
      width: '900px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.app.versions) {
        this.app.versions = this.app.versions.map((v: AppVersionDto) => v.id === result.id ? result : v);
      }
    });
  }


}
