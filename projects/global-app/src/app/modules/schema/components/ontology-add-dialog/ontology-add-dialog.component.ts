import {Component, inject, signal} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyEditComponent} from "@global-app/schema/components/ontology-edit/ontology-edit.component";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-ontology-add-dialog',
  imports: [
    CloseableDialogTitleComponent,
    TranslatePipe,
    OntologyEditComponent,
    MatDialogActions,
    MatDialogContent,
    MatButton,
    MatIcon,
    ErrorCardComponent,
    JsonPipe
  ],
  templateUrl: './ontology-add-dialog.component.html',
  styleUrl: './ontology-add-dialog.component.scss',
})
export class OntologyAddDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OntologyAddDialogComponent>);
  private readonly ontologyService: OntologyService = inject(OntologyService);

  ontology = signal<OntologyNodeDTO>({})
  error = signal<string | undefined>(undefined)

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  create() {
    this.ontologyService.create({ontology: this.ontology(), edges: []})
      .subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (err) => this.error.set(err)
      });

  }
}
