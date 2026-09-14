import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {DataTypeNodeDTO, DataTypes, DataTypeValidationType} from "../../dto/datatype";
import {MatSelectModule} from "@angular/material/select";
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TranslatePipe} from "@ngx-translate/core";
import {dataTypeCombinations, DataTypeCombinations} from "@global-app/schema/model/datatype";
import {ActivatedRoute, Router} from "@angular/router";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {MatCardModule} from "@angular/material/card";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-detail-datatype',
  templateUrl: './detail-datatype.component.html',
  styleUrl: './detail-datatype.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    HeaderComponent,
    PageWrapperComponent,
    InfoCardComponent,
    BadgeComponent,
    BtnComponent,
    MatCardModule,
    MatSlideToggleModule,
  ]
})
export class DetailDatatypeComponent {
  protected readonly DataTypes = DataTypes;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  readonly types: DataTypeCombinations[] = dataTypeCombinations;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly dataTypeId = signal<string | null>(this.route.snapshot.paramMap.get('datatypeId'));
  readonly data = signal<DataTypeNodeDTO>(this.createEmptyDataType());

  toCheckValue: string = '';

  constructor() {
    const id = this.dataTypeId();
    if (id) {
      this.loadDataType(id);
    }
  }

  getValidators(): string[] {
    if (!this.data().type) {
      return [];
    }
    const type = this.types.find(type => type.value === this.data().type);
    return type?.possibleValidators || [];
  }

  addValidator(): void {
    this.data().validations.push({name: '', validator: '', message: ''});
  }


  addOption(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.removeOption(value);
      this.data().options.push(value);
    }

    event.chipInput!.clear();
  }

  removeOption(option: string): void {
    this.data.update(data => ({
      ...data,
      options: data.options.filter(currentOption => currentOption !== option),
    }));
  }

  editOption(option: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.removeOption(option);
      return;
    }
    const data = this.data();
    const index = data.options.indexOf(option);
    data.options[index] = value;
  }

  isDisabled(): boolean {
    const data = this.data();
    return !!(data.id && (data.schemaIds?.length ?? 0) > 0);
  }

  checkValidation() {
    this.dataTypeService.checkValidation(this.data(), this.toCheckValue).subscribe(() => {
      this.toCheckValue = '';
    });
  }

  onTypeChange(): void {
    this.data().validations = [];
    this.data().options = [];
  }

  save(): void {
    const data = {
      ...this.data(),
      validations: this.data().validations.filter(validation =>
        validation.name !== '' && validation.name !== DataTypeValidationType.REQUIRED
      ),
    };
    this.data.set(data);
    this.saving.set(true);
    const request = data.id
      ? this.dataTypeService.update(data)
      : this.dataTypeService.persist(data);

    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        const savedId = saved.id ?? data.id;
        if (savedId) {
          this.router.navigate(['/data-modelling/data-types', savedId]);
        } else {
          this.router.navigate(['/data-modelling/data-types']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.message ?? 'Error saving datatype.');
      },
    });
  }

  private loadDataType(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.dataTypeService.getById(id).subscribe({
      next: (dataType) => {
        this.data.set({
          ...this.createEmptyDataType(),
          ...dataType,
          validations: (dataType.validations ?? []).filter(validation => validation.name !== DataTypeValidationType.REQUIRED),
          options: dataType.options ?? [],
          allowNullValues: dataType.allowNullValues ?? true,
          isRequired: dataType.isRequired ?? false,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Error loading datatype.');
        this.loading.set(false);
      },
    });
  }

  private createEmptyDataType(): DataTypeNodeDTO {
    const ontologyId = this.route.snapshot.queryParamMap.get('ontologyId');
    const ontologyIds = ontologyId ? [ontologyId] : [];
    return {
      name: '',
      description: '',
      type: DataTypes.STRING,
      allowNullValues: true,
      isRequired: false,
      validations: [],
      options: [],
      ontologyIds,
      schemaIds: [],
    };
  }

  protected pageTitle(): string {
    const data = this.data();
    if (data.id) {
      return data.name || 'Datatype detail';
    } else {
      return 'Create data type';
    }
  }

  protected pageDescription(): string {
    if (this.isDisabled()) {
      return `Used by ${this.data().schemaIds?.length ?? 0} schemas. Editing is locked to protect existing data contracts.`;
    } else {
      return 'Define how a shared data standard accepts values, nulls and validation rules.';
    }
  }

}
