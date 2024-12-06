import {Component, inject} from '@angular/core';
import {AppDto} from "../../../../../../../app-store/dto/app";
import {AppStoreModule} from "../../../../../../../app-store/app-store.module";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";

@Component({
  selector: 'app-app-select-dialog',
  standalone: true,
  imports: [
    AppStoreModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app-select-dialog.component.html',
  styleUrl: './app-select-dialog.component.scss'
})
export class AppSelectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AppSelectDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);


  public itemClick(app: AppDto) {
    this.dialogRef.close(app);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
