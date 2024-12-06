import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {AppService} from "@global-app/app-store/service/app.service";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-app-publish-dialog-warning',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './app-publish-dialog-warning.component.html',
  styleUrl: './app-publish-dialog-warning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPublishDialogWarningComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<AppPublishDialogWarningComponent> = inject(MatDialogRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly data = inject<AppDetailDto>(MAT_DIALOG_DATA);
  private readonly appService: AppService = inject(AppService);

  changelog: string = '';

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  public publish(): void {
    this.appService.publishApp(this.data.id, this.changelog).subscribe((app) => {
      this.dialogRef.close(app);
    });
  }

}
