import {Component, inject} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle,} from '@angular/material/dialog';
import {SchemaService} from "@global-app/schema/services/schema.service";
import {TranslatePipe} from "@ngx-translate/core";



@Component({
  selector: 'app-schema-create-root-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    TranslatePipe,
  ],
  templateUrl: './schema-create-root-dialog.component.html',
  styleUrl: './schema-create-root-dialog.component.scss'
})
export class SchemaCreateRootDialogComponent {
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
