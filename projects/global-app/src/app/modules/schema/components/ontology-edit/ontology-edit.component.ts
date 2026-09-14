import {Component, input, model} from '@angular/core';
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRemove, MatChipRow} from "@angular/material/chips";
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-ontology-edit',
  imports: [
    FormsModule,
    MatButton,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    TranslatePipe
  ],
  templateUrl: './ontology-edit.component.html',
  styleUrl: './ontology-edit.component.scss',
})
export class OntologyEditComponent {
  ontology = model.required<OntologyNodeDTO>();
  limitWidth = input<boolean>(true);
  twoColumns = input<boolean>(false);

  addName(): void {
    if (!this.ontology()) {
      return;
    }
    this.ontology.update(o => {
      if (!o.names) {
        o.names = [];
      }
      o.names.push('');
      return o;
    });
  }

  removeName(index: number): void {
    if (!this.ontology()) {
      return;
    }
    this.ontology.update((o) => {
      if (!o.names) return o;
      o.names.splice(index, 1);
      return o;
    });

  }


  addChip(
    field: 'codes' | 'sabs' | 'auis',
    event: MatChipInputEvent
  ): void {
    if (!this.ontology()) {
      return;
    }
    const rawValue = event.value ?? '';
    const value = rawValue.trim();

    if (!value) {
      event.chipInput?.clear();
      return;
    }
    this.ontology.update((o) => {
      if (!o[field]) {
        o[field] = [];
      }
      (o[field] as string[]).push(value);
      return o;
    });

    event.chipInput?.clear();
  }

  removeChip(field: 'codes' | 'sabs' | 'auis', index: number): void {
    if (!this.ontology()) {
      return;
    }
    this.ontology.update((o) => {
      const list = o[field] as string[] | undefined;
      if (!list) return o;
      list.splice(index, 1);
      return o;
    });
  }

}
