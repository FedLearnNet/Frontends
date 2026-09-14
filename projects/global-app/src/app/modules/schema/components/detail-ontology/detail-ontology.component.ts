import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyNodeDTO} from "../../dto/ontology";
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ListDatatypesComponent} from '../list-datatypes/list-datatypes.component';
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {SchemaCardListComponent} from '../schema-card-list/schema-card-list.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {
  DetailOntologyRelationListsComponent
} from "@global-app/schema/components/detail-ontology-relation-lists/detail-ontology-relation-lists.component";
import {OntologyEditComponent} from "@global-app/schema/components/ontology-edit/ontology-edit.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {finalize} from "rxjs";

@Component({
  selector: 'app-detail-ontology',
  templateUrl: './detail-ontology.component.html',
  styleUrl: './detail-ontology.component.scss',
  imports: [
    MatDivider,
    MatButton,
    MatIcon,
    ListDatatypesComponent,
    DatatypeCardComponent,
    SchemaCardListComponent,
    TranslatePipe,
    DetailOntologyRelationListsComponent,
    OntologyEditComponent,
    EmptyStateComponent,
    HeaderComponent,
    PageWrapperComponent
  ]
})
export class DetailOntologyComponent {
  readonly ontologyService: OntologyService = inject(OntologyService);

  readonly ontologyId = input<string>();

  ontology = signal<OntologyNodeDTO | undefined>(undefined);
  firstName = computed(() => {
    const o = this.ontology();
    if (o) {
      return o.names?.[0] ?? "";
    }
    return "";
  });
  error = signal<string | null>(null);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  private readonly loadOntologyEffect = effect(() => {
    const id = this.ontologyId();
    if (!id) {
      return;
    }

    this.error.set(null);

    if (id === 'new') {
      this.ontology.set({});
      return;
    }

    this.loading.set(true);
    this.ontologyService.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (ontology) => this.ontology.set(ontology),
        error: (err) => {
          this.ontology.set(undefined);
          this.error.set(this.toErrorMessage(err));
        }
      });
  });

  saveOntology(): void {
    const ontology = this.ontology();
    if (!ontology) return;

    this.error.set(null);
    this.saving.set(true);
    this.ontologyService.put(ontology)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (savedOntology) => this.ontology.set(savedOntology),
        error: (err) => this.error.set(this.toErrorMessage(err))
      });
  }

  addName(): void {
    if (!this.ontology()) {
      return;
    }
    this.ontology.update((o) => o ? ({...o, names: [...(o.names ?? []), '']}) : o);
  }

  removeName(index: number): void {
    if (!this.ontology()) {
      return;
    }
    this.ontology.update((o) => o ? ({...o, names: (o.names ?? []).filter((_, i) => i !== index)}) : o);
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
    this.ontology.update((o) => o ? ({...o, [field]: [...((o[field] as string[] | undefined) ?? []), value]}) : o);

    event.chipInput?.clear();
  }

  removeChip(field: 'codes' | 'sabs' | 'auis', index: number): void {

    if (!this.ontology()) {
      return;
    }
    this.ontology.update((o) => o ? ({
      ...o,
      [field]: ((o[field] as string[] | undefined) ?? []).filter((_, i) => i !== index)
    }) : o);
  }

  private toErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const error = (err as { error?: unknown }).error;
      if (typeof error === 'string') return error;
      if (error) return JSON.stringify(error);
    }
    return 'Something went wrong while loading the ontology.';
  }
}
