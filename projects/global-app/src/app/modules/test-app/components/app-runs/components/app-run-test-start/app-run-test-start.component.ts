import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {AppRunHyperparameterComponent} from "../app-run-hyperparameter/app-run-hyperparameter.component";
import {ControllerSocketService} from "../../../../service/testembed-socket.service";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {TestRunCreateDTO} from "../../../../dto/test-run";
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteTrigger,
  MatOption
} from "@angular/material/autocomplete";
import {MatDivider, MatDividerModule} from "@angular/material/divider";
import {map, Observable} from "rxjs";
import {startWith} from "rxjs/operators";
import {MatOptionModule} from "@angular/material/core";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {SelectQueryComponent} from "@global-app/find-data/components/select-query/select-query.component";
import {MatIcon} from "@angular/material/icon";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {ProjectDto} from "@global-app/project/dto/project";
import {ProjectService} from "@global-app/project/services/project-service";

interface AppRunTestStartDialogData {
  app: AppDetailDto;
  datafiles: string[];
}

@Component({
  selector: 'app-app-run-test-start',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    AppRunHyperparameterComponent,
    MatAutocompleteModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './app-run-test-start.component.html',
  styleUrl: './app-run-test-start.component.scss'
})
export class AppRunTestStartComponent implements OnInit {
  private readonly projectService: ProjectService = inject(ProjectService);
  private readonly controllerSocketService: ControllerSocketService = inject(ControllerSocketService)
  readonly dialogRef = inject(MatDialogRef<AppRunTestStartComponent>);
  readonly data = inject<AppRunTestStartDialogData>(MAT_DIALOG_DATA);

  dynamicHyperparams: { [key: string]: any } = {};
  hyperParamsValid: boolean = false;

  datafiles: string[] = [];
  projectList: ProjectDto[] = [];
  filteredOptions: Observable<string[]>;

  testRunControl = new FormGroup({});
  useLocalFiles = false;
  projectId?: number;

  ngOnInit() {
    this.datafiles = this.data.datafiles;
    this.getInputs().forEach((input) => {
      const control = new FormControl<string>('', [Validators.required]);
      this.testRunControl.addControl(input as keyof typeof this.testRunControl.controls, control);
      this.setupValueChanges(control);
    });
    this.projectService.getProjects().subscribe((projects) => {
      this.projectList = projects;
    });
  }

  isValid(): boolean {

    const hyperParamValid = Object.keys(this.dynamicHyperparams).length > 0 && this.hyperParamsValid;
    if(!hyperParamValid) {
      return false;
    }
    if(this.useLocalFiles) {
      return this.testRunControl.valid;
    }
    return this.projectId !== undefined;
  }

  onHyperParamsChanged(hyperparams: { [key: string]: any }) {
    this.dynamicHyperparams = hyperparams;
  }

  onRunClick(): void {
    const create: TestRunCreateDTO = {
      hyperParams: this.dynamicHyperparams,
      federatedAppVersionId: this.data.app.latestVersionId
    }
    if (this.useLocalFiles) {
      const inputFilePaths: { [key: string]: string } = {};
      this.getInputs().forEach((input) => {
        inputFilePaths[input] = this.testRunControl.get(input)!.value;
      });
      create.inputFilePaths = inputFilePaths;
    } else {
      create.projectId = this.projectId;
    }
    this.controllerSocketService.runTest(create);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getInputs(): string[] {
    return this.data.app.appConfig.input.map((input) => input.variableName ?? input.name);
  }

  setupValueChanges(control: FormControl) {
    this.filteredOptions = control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }


  getFormControl(name: string): FormControl {
    return this.testRunControl.get(name) as FormControl;
  }

  isProjectValid(project: ProjectDto): boolean {
    if (!project || !project.dataTypeIds) {
      return false;
    }
    return project.dataTypeIds.length > 0;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.datafiles.filter(option => option.toLowerCase().includes(filterValue));
  }



}
