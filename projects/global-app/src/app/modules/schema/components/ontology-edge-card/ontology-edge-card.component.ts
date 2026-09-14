import {ChangeDetectionStrategy, Component, computed, inject, input, model, Signal, signal} from '@angular/core';
import {OntologyEdgeDTO, OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  OntologySelectDialogComponent
} from "@global-app/schema/components/ontology-select-dialog/ontology-select-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {OntologyService} from "@global-app/schema/services/ontology.service";

type RelationDirection = 'parent' | 'child';

@Component({
  selector: 'app-ontology-edge-card',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormFieldModule,
    MatInput,
    FormsModule,
    BadgeComponent,
    ReactiveFormsModule
  ],
  templateUrl: './ontology-edge-card.component.html',
  styleUrl: './ontology-edge-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OntologyEdgeCardComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly ontologyService: OntologyService = inject(OntologyService);

  edge = model<OntologyEdgeDTO>({});
  node = model<OntologyNodeDTO | undefined>(undefined);
  sourceNodeId = input.required<string>();

  readonly form = this.fb.nonNullable.group({
    description: [''],
    rel: [''],
    rela: [''],
    sab: [''],
  });

  readonly isEditMode = signal(false);
  readonly relationDirection: Signal<RelationDirection> = computed(() => {
    if (this.edge().sourceId === this.sourceNodeId()) {
      return "parent";
    }
    return "child";
  });

  readonly hasDescription = computed(
    () => !!this.edge()?.description && this.edge()!.description!.trim().length > 0,
  );

  ontologyName = computed(() => {
    const node = this.node();
    if (!node) {
      return "Unknown";
    }
    return node.names && node.names.length > 0 ? node.names.reduce((shortest, name) => name.length < shortest.length ? name : shortest) : "";
  })

  toggleEdit(): void {
    if (!this.isEditMode()) {
      const current = this.edge();
      this.form.patchValue({
        description: current.description ?? '',
        rel: current.rel ?? '',
        rela: current.rela ?? '',
        sab: current.sab ?? '',
      });
      this.isEditMode.set(true);
    } else {
      this.isEditMode.set(false);
      const current = this.edge();
      this.form.reset({
        description: current.description ?? '',
        rel: current.rel ?? '',
        rela: current.rela ?? '',
        sab: current.sab ?? '',
      });
    }
  }


  save(): void {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    this.edge.update(e => {
      return {
        ...e,
        ...formValue,
      };
    })
    this.isEditMode.set(false);

   // this.ontologyService.
  }


  switchDirection(direction: RelationDirection): void {
    if (this.relationDirection() === direction) return;
    if (!this.node()) return;
    this.edge.update(e => {
      const { sourceId, targetId } = e;
      return { ...e, sourceId: targetId, targetId: sourceId };
    });
  }

  protected changeOntology() {

    this.dialog.open(OntologySelectDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    }).afterClosed().subscribe((result) => {
      if (!result) return;
      this.node.set(result);
      const nodeId: string = result.id;
      const sourceId = this.sourceNodeId();

      this.edge.update(e => {
        if (this.relationDirection() === "parent") {
          e.sourceId = sourceId;
          e.targetId = nodeId;
        } else {
          e.targetId = sourceId;
          e.sourceId = nodeId;
        }
        return e;
      });
    });
  }
}
