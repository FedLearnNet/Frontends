import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {DataTypeDTO} from "../../dto/datatype";
import {MatSelectModule} from "@angular/material/select";
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";

interface DataType {
  value: string;
  viewValue: string;
  possibleValidators?: string[];
}

@Component({
  selector: 'app-detail-datatype',
  templateUrl: './detail-datatype.component.html',
  styleUrl: './detail-datatype.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    MatDialogClose,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
})
export class DetailDatatypeComponent {
  readonly dialogRef = inject(MatDialogRef<DetailDatatypeComponent>);
  readonly data = inject<DataTypeDTO>(MAT_DIALOG_DATA);
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  readonly types: DataType[] = [
    {value: 'int', viewValue: 'Integer', possibleValidators: ['min', 'max', 'required']},
    {value: 'float', viewValue: 'Float', possibleValidators: ['min', 'max', 'required']},
    {value: 'boolean', viewValue: 'Boolean', possibleValidators: ['required']},
    {value: 'string', viewValue: 'Text', possibleValidators: ['minLength', 'maxLength', 'required', 'pattern']},
    {value: 'file', viewValue: 'File (?)'},
    {value: 'date', viewValue: 'Date (?)', possibleValidators: ['minLength', 'maxLength', 'required', 'pattern']},
    {
      value: 'date-time',
      viewValue: 'date-time (?)',
      possibleValidators: ['minLength', 'maxLength', 'required', 'pattern']
    },
    {value: 'categorical', viewValue: 'categorical'},
  ];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  toCheckValue: string = '';

  onNoClick(): void {
    this.dialogRef.close();
  }

  getValidators(): string[] {
    if (!this.data.type) {
      return [];
    }
    const type = this.types.find(type => type.value === this.data.type);
    return type?.possibleValidators || [];
  }

  addValidator(): void {
    this.data.validations.push({name: '', validator: '', message: ''});
  }


  addOption(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.removeOption(value);
      this.data.allowedValues.push(value);
    }

    event.chipInput!.clear();
  }

  removeOption(option: string): void {
    this.data.allowedValues = this.data.allowedValues.filter(fruit => fruit !== option);
  }

  editOption(option: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.removeOption(option);
      return;
    }
    const index = this.data.allowedValues.indexOf(option);
    this.data.allowedValues[index] = value;
  }

  isDisabled(): boolean {
    return !!(this.data.uniqueId && this.data.schemaIds!.length > 0);
  }

  checkValidation() {
    this.dataTypeService.checkValidation(this.data, this.toCheckValue).subscribe(() => {
      this.toCheckValue = '';
    });
  }

  save(): void {
    this.data.validations = this.data.validations.filter(validation => validation.name !== '');
    if (this.data.uniqueId) {
      this.dataTypeService.update(this.data).subscribe(() => {
        this.dialogRef.close();
      });
    } else {
      this.dataTypeService.persist(this.data).subscribe(() => {
        this.dialogRef.close();
      })
    }
  }

}
