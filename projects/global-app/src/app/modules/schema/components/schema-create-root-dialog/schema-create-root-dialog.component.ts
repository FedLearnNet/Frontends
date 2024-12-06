import {Component, inject, OnInit} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {SchemaService} from "@global-app/schema/services/schema.service";


@Component({
  selector: 'app-schema-create-root-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatDialogActions, MatDialogContent, MatDialogTitle],
  templateUrl: './schema-create-root-dialog.component.html',
  styleUrl: './schema-create-root-dialog.component.scss'
})
export class SchemaCreateRootDialogComponent  {
  readonly dialogRef = inject(MatDialogRef<SchemaCreateRootDialogComponent>);
  readonly schemaService: SchemaService = inject(SchemaService);

  name: string = '';
  description: string = '';

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveRoot(): void {
    this.schemaService.createRoot(this.name, this.description).subscribe((schema) => {
      this.dialogRef.close(schema);
    });
  }
}
