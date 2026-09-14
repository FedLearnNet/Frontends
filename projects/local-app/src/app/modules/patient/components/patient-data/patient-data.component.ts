import {ChangeDetectionStrategy, Component, computed, EventEmitter, forwardRef, inject, input, OnInit, Output, signal} from '@angular/core';
import { PatientDataEntryDto, PatientDto } from "../../dto/patient";
import {PatientDataGroupComponent} from "../patient-data-group/patient-data-group.component";
import {SchemaNodeNestedDto, isSchemaDataColumnNode} from "@local-app/cohort/dto/schema";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {
  PatientDataGroupDetailInfoDialogComponent
} from "../patient-data-group-detail-info-dialog/patient-data-group-detail-info-dialog.component";

@Component({
  selector: 'app-patient-data',
  imports: [
    forwardRef(() => PatientDataComponent),
    PatientDataGroupComponent,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './patient-data.component.html',
  styleUrl: './patient-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDataComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);

  schemaNode = input.required<SchemaNodeNestedDto>();
  schemaLevel = input.required<number>();
  patient = input.required<PatientDto>();
  formMode = input<boolean>(false);
  defaultExpanded = input<boolean>(false);
  autoOpenAdd = input<boolean>(false);
  /** When false, data is display-only (patient detail view). */
  editable = input<boolean>(false);
  /** When true, only one data entry may exist per schema node (patient create). */
  singleValuePerNode = input<boolean>(false);

  @Output() entryCreated = new EventEmitter<PatientDataEntryDto>();
  @Output() entryUpdated = new EventEmitter<PatientDataEntryDto>();
  @Output() entryDeleted = new EventEmitter<number>();

  showChart = signal<boolean>(false);
  expanded = signal<boolean>(false);

  ngOnInit(): void {
    this.expanded.set(this.defaultExpanded());
  }

  sortedChildNodes = computed(() => {
    const nodes = this.schemaNode().childNodes;
    if (!nodes?.length) return [];
    return [...nodes].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly hasFieldGridChildren = computed(() => {
    const children = this.sortedChildNodes();
    return children.length > 0 && children.every(child => isSchemaDataColumnNode(child));
  });

  getEntriesForSchema(schemaId: number) {
    const dataEntries = this.patient().dataEntries;
    return dataEntries.filter(entry => entry.schemaNodeId === schemaId);
  }

  shouldShowDataGroup(node: SchemaNodeNestedDto): boolean {
    return isSchemaDataColumnNode(node);
  }

  isGroupNode(node: SchemaNodeNestedDto): boolean {
    return !!(node.childNodes?.length);
  }

  toggleExpanded(): void {
    this.expanded.update(v => !v);
  }

  expandToSchemaNode(targetId: number): boolean {
    if (!this.containsSchemaNode(targetId)) {
      return false;
    }
    if (this.isGroupNode(this.schemaNode())) {
      this.expanded.set(true);
    }
    return true;
  }

  containsSchemaNode(targetId: number): boolean {
    return this.nodeContains(this.schemaNode(), targetId);
  }

  private nodeContains(node: SchemaNodeNestedDto, targetId: number): boolean {
    if (node.id === targetId) {
      return true;
    }
    return (node.childNodes ?? []).some(child => this.nodeContains(child, targetId));
  }

  toggleShowChart() {
    this.showChart.update(s => !s);
  }

  onEntryCreated(entry: PatientDataEntryDto) {
    this.entryCreated.emit(entry);
  }

  onEntryUpdated(entry: PatientDataEntryDto) {
    this.entryUpdated.emit(entry);
  }

  onEntryDeleted(entryId: number) {
    this.entryDeleted.emit(entryId);
  }

  public openInfo() {
    this.dialog.open(PatientDataGroupDetailInfoDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: this.schemaNode()
    });
  }
}
