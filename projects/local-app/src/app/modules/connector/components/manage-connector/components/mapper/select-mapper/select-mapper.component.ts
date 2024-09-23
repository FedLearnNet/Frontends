import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ConnectorEditMapperComponent} from "../edit-mapper/edit-mapper.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {AsyncPipe, CommonModule} from "@angular/common";
import {Schema, SchemaFieldStructure} from "@shared-lib/models";
import {getSchemaFormName} from "@shared-lib/utils";


interface Option {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-select-mapper',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatDivider,
    MatTooltipModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,],
  templateUrl: './select-mapper.component.html',
  styleUrl: './select-mapper.component.scss'
})
export class ConnectorSelectMapperComponent implements OnInit {
  column = 'test'
  schema: Schema
  clearValueIfBlank = false;
  levels: number[] = [0];
  searchTexts: string[] = [];
  selectedValues: string[] = [];
  filteredOptions: Option[][] = [];
  allOptions: Option[][] = [];

  constructor(public dialogRef: MatDialogRef<ConnectorEditMapperComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                column: string,
                removeFieldsPath?: string[],
                value: string,
                schema: Schema
              }) {
  }

  ngOnInit(): void {
    this.column = this.data.column;
    this.schema = this.data.schema;
    if (this.data.removeFieldsPath) {
      this.schema = this.removeFields(this.schema, this.data.removeFieldsPath);
    }
    this.initializeFirstLevelOptions();
    this.initializeValues();
  }

  initializeFirstLevelOptions(): void {
    this.allOptions[0] = this.schema.fields.map(field => ({
      value: field.name,
      viewValue: getSchemaFormName(field.name, field.label)
    }));
    this.filteredOptions[0] = this.allOptions[0];
  }

  initializeValues(): void {
    if (this.data.value) {
      const values = this.data.value.split('.');
      for (let i = 0; i < values.length; i++) {
        this.searchTexts[i] = values[i];
        this.selectedValues[i] = values[i];
        this.updateFilteredOptions(i);
        if (i < values.length - 1) {
          this.loadNextLevelOptions(i, values[i]);
        }
      }
    }
  }

  loadNextLevelOptions(level: number, selectedValue: string): void {
    this.clearAfterLevel(level);
    const currentField = this.getFieldByValue(level, selectedValue);
    if (currentField && currentField.fields && this.levels.indexOf(level + 1) === -1) {
      this.levels.push(level + 1);
      this.searchTexts.push('');
      this.selectedValues.push('');
      this.allOptions[level + 1] = currentField.fields.map(field => ({
        value: field.name,
        viewValue: getSchemaFormName(field.name, field.label)
      }));
      this.filteredOptions[level + 1] = this.allOptions[level + 1];
      this.updateFilteredOptions(level + 1);
    }
  }

  getFieldByValue(level: number, value: string): SchemaFieldStructure | undefined {
    let fields = this.schema.fields;
    let foundField;
    for (let i = 0; i <= level; i++) {
      const field = fields.find(f => f.name === (this.selectedValues[i] || value));
      if (field && field.fields) {
        fields = field.fields;
        foundField = field;
      } else {
        return field;
      }
    }
    if (foundField) {
      return foundField;
    }
    return undefined;
  }

  updateFilteredOptions(level: number) {
    if (this.searchTexts[level]) {
      const filterValue = this.searchTexts[level].toLowerCase();
      this.filteredOptions[level] = this.allOptions[level].filter(option => option.viewValue.toLowerCase().includes(filterValue));
    } else {
      this.filteredOptions[level] = this.allOptions[level];
    }
  }

  clearFilteredOptions(level: number) {
    this.selectedValues[level] = '';
    this.searchTexts[level] = '';
    this.filteredOptions[level] = this.allOptions[level];
  }

  onSelection(level: number, value: string) {
    this.selectedValues[level] = value;
    this.loadNextLevelOptions(level, value);
    if (level < this.levels.length - 1) {
      this.selectedValues[level + 1] = '';
      this.searchTexts[level + 1] = '';
    }
  }


  isApplyEnabled(): boolean {
    if (this.selectedValues.length === 0) {
      return true;
    }
    return this.selectedValues.length === this.levels.length && this.selectedValues.every(value => !!value);
  }

  clear(): void {
    this.searchTexts = [];
    this.filteredOptions = [];
    this.selectedValues = [];
    this.clearValueIfBlank = false;
  }

  clearAfterLevel(level: number): void {
    this.searchTexts = this.searchTexts.slice(0, level + 1);
    this.filteredOptions = this.filteredOptions.slice(0, level + 1);
    this.selectedValues = this.selectedValues.slice(0, level + 1);
    this.levels = this.levels.slice(0, level + 1);
    this.clearValueIfBlank = false;
  }

  removeNestedField(fieldStructure: SchemaFieldStructure[], path: string[]): SchemaFieldStructure[] {
    if (path.length === 0) return fieldStructure;
    const [current, ...rest] = path;

    return fieldStructure.reduce((acc, field) => {
      if (field.name !== current) {
        acc.push(field);
      } else if (rest.length > 0 && field.fields) {
        field.fields = this.removeNestedField(field.fields, rest);
        acc.push(field);
      }
      return acc;
    }, [] as SchemaFieldStructure[]);
  }

  removeEmptyGroups(fieldStructure: SchemaFieldStructure[]): SchemaFieldStructure[] {
    return fieldStructure.reduce((acc, field) => {
      if (field.nodeType === 'group' && (!field.fields || field.fields.length === 0)) {
        // Skip this field
      } else {
        if (field.fields && field.fields.length > 0) {
          field.fields = this.removeEmptyGroups(field.fields);
        }
        acc.push(field);
      }
      return acc;
    }, [] as SchemaFieldStructure[]);
  }

  removeFields(schema: Schema, fieldsToRemove: string[]): Schema {
    fieldsToRemove.forEach(fieldPath => {
      if (!fieldPath || fieldPath === this.data.value) return;
      const pathArray = fieldPath.split('.');
      schema.fields = this.removeNestedField(schema.fields, pathArray);
    });
    schema.fields = this.removeEmptyGroups(schema.fields);
    return schema;
  }

  apply(): void {
    const displayValue = this.selectedValues.join(' > ');
    const value = this.selectedValues.join('.');
    this.dialogRef.close({displayValue: displayValue, value: value, clearValueIfBlank: this.clearValueIfBlank});
  }



}
