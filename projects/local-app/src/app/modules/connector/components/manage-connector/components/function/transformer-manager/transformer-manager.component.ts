import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FunctionsDetailDTO} from "../../../../../dto/function";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {ManageConnectorComponent} from "../../../manage-connector.component";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {NgForOf, NgIf} from "@angular/common";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggle, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCell, MatTable, MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBar} from "@angular/material/snack-bar";
import {cloneDeep} from "lodash";
import {MatCheckboxModule} from "@angular/material/checkbox";

@Component({
  selector: 'app-transformer-manager',
  templateUrl: './transformer-manager.component.html',
  styleUrl: './transformer-manager.component.scss',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDividerModule,
    NgIf,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggle,
    NgForOf,
    MatCell,
    MatTable,
    MatTableModule,
    MatTooltipModule
  ],
})
export class ConnectorTransformerFunctionManagerComponent implements OnInit {

  @ViewChild('formRef') formElement: any;
  form: FormGroup;
  displayedColumns: string[] = ['name', 'column', 'value']; //'function',
  displayedReturnColumns: string[] = ['name', 'column', 'new-column']; //'function',
  data?: FunctionsDetailDTO;
  selectedModule: string;
  selectedMethod: string;
  selectedColumns: string[] = [];
  functions: FunctionsDetailDTO[];
  columns: string[];

  onEdit: boolean = false;

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<ManageConnectorComponent>,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public func: {
                functions: FunctionsDetailDTO[],
                columns: string[]
                data: FunctionsDetailDTO
              }) {
    this.form = this.fb.group({
      parameters: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.functions = this.func.functions;
    this.columns = this.func.columns;
    if (this.func.data) {
      this.selectedModule = this.func.data.module;
      this.selectedMethod = this.func.data.methodName;
      if (this.func.data.column) {
        this.selectedColumns = this.func.data.column.split(',');
      }
      this.setMethod();
      const newData = this.func.data;
      newData.parameters = this.data?.parameters || [];
      newData.returnKeys = this.data?.returnKeys || [];
      this.data = newData;
      this.onEdit = true;
    }
    this.createForm();
  }

  get modules(): string[] {
    return [...new Set(this.functions.map(f => f.module))];
  }

  get methods(): string[] {
    return this.functions
      .filter(f => f.module === this.selectedModule)
      .map(f => f.methodName);
  }

  setMethod(): void {
    this.data = this.functions
      .find(f => f.module === this.selectedModule && f.methodName === this.selectedMethod);
    this.onEdit = false;
    this.createForm();
  }

  createForm(): void {
    if (!this.data) {
      return;
    }
    const parameterGroups = this.data.parameters.flatMap(param => {
        if (param.keys.length === 0) {
          let defaultValue = param.default_value || '';
          let defaultColumn = '';

          let disabledColumn = defaultValue !== '';
          let disabledValue = false;
          if (this.onEdit) {
            const found = this.data!.inputMapping![param.name];
            if (found) {
              if (found.startsWith('[VALUE]')) {
                defaultValue = found.replace('[VALUE]', '');
                disabledColumn = true;
              } else {
                defaultColumn = found
                disabledValue = true;
              }
            }
          }
          return this.fb.group({
            functionName: param.name,
            key: param.name,
            choices: [param.choices || []],
            column: new FormControl({value: defaultColumn, disabled: disabledColumn}, Validators.required),
            value: new FormControl({value: defaultValue, disabled: disabledValue}, Validators.required),
            doc: param.doc,
          });
        }
        return param.keys.map(key => {
          let defaultValue = '';
          let defaultColumn = '';

          let disabledColumn = false;
          let disabledValue = false;
          if (this.onEdit) {
            const found = this.data!.inputMapping![key];
            if (found) {
              if (this.columns.includes(found)) {
                defaultColumn = found
                disabledValue = true;
              } else {
                if (found.startsWith('[VALUE]')) {
                  defaultValue = found.replace('[VALUE]', '');
                } else {
                  defaultValue = found;
                }
                disabledColumn = true;
              }
            }
          }
          return this.fb.group({
            functionName: param.name,
            key: key,
            choices: [param.choices || []],
            column: new FormControl({value: defaultColumn, disabled: disabledColumn}, Validators.required),
            value: new FormControl({value: defaultValue, disabled: disabledValue}, Validators.required),
            doc: param.doc,
          });
        });
      }
    );

    const returnGroups = this.data.returnKeys.map(param => {
      let defaultValue = '';
      let defaultColumn = '';
      let disabledColumn = false;
      let disabledValue = false;
      if (this.onEdit) {
        const found = this.data!.returnMapping![param];
        if (found) {
          if (this.columns.includes(found)) {
            defaultColumn = found
            disabledValue = true;
          } else {
            defaultValue = found
            disabledColumn = true;
          }
        }
      }
      return this.fb.group({
        key: param,
        column: new FormControl({value: defaultColumn, disabled: disabledColumn}, Validators.required),
        value: new FormControl({value: defaultValue, disabled: disabledValue}, Validators.required),
        doc: null//param.doc,
      });
    });

    const parametersArray = this.fb.array(parameterGroups);
    const returnArray = this.fb.array(returnGroups);
    this.form.setControl('parameters', parametersArray);
    this.form.setControl('returns', returnArray);
  }


  clearInput(paramGroup: FormGroup, key: string): void {
    const control = paramGroup.get(key);
    if (control) {
      control.setValue('');
      this.updateControlStates(paramGroup);
    }
  }

  updateControlStates(paramGroup: FormGroup): void {
    const columnControl = paramGroup.get('column');
    const valueControl = paramGroup.get('value');

    if (columnControl?.value
    ) {
      valueControl?.disable();
    } else {
      valueControl?.enable();
    }

    if (valueControl?.value) {
      columnControl?.disable();
    } else {
      columnControl?.enable();
    }
  }

  get parametersFormArray():
    FormArray {
    return this.form.get('parameters') as FormArray;
  }

  get returnFormArray():
    FormArray {
    return this.form.get('returns') as FormArray;
  }


  onSubmit(): void {
    if (this.form.invalid && this.hasData()
    ) {
      this.snackBar.open('Please fill all required fields', 'Close', {duration: 3000});
      return;
    }
    const formValue = this.form.value;
    const dto = this.analyzeOutput(formValue);
    this.dialogRef.close(dto);
  }

  analyzeOutput(input: any): FunctionsDetailDTO | undefined {
    if (!this.data) return;
    const dto = cloneDeep(this.data);
    dto.inputMapping = {};
    dto.returnMapping = {};
    input.parameters.forEach((param: any) => {
      if (param.column) {
        dto.inputMapping![param.key] = param.column;
      } else {
        dto.inputMapping![param.key] = "[VALUE]" + param.value;
      }
    });
    input.returns.forEach((param: any) => {
      dto.returnMapping![param.key] = param.column || param.value;
    });
    dto.column = this.selectedColumns.join(',');
    //TODO add for_list
    return dto;
  }

  hasData(): boolean {
    if (!this.data) return false;
    if (!this.data.onRow) return this.selectedColumns.length > 0;
    return true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDeleteClick(): void {
    this.dialogRef.close({delete: true});
  }

  submitForm(): void {
    if (this.formElement
    ) {
      this.formElement.nativeElement.requestSubmit();
    }
  }
}
