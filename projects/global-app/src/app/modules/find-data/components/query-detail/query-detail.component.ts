import {
  Component,
  QueryList,
  ViewChildren,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {QueryService} from '@global-app/find-data/services/query.service';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {QueryConfig} from '@global-app/find-data/models';
import {
  QueryBuilderItemComponent
} from '@global-app/find-data/components/query-builder-item/query-builder-item.component';
import {CreateQueryDTO, QueryDTO, QueryItemDTO} from "@global-app/find-data/dto/query";
import {CommonModule} from "@angular/common";
import {MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {cloneDeep} from "lodash";


interface QueryDetail {
  queryConfigs: QueryConfig[];
  queryData?: QueryDTO;
}

@Component({
  selector: 'app-query-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
    MatIconButton,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    QueryBuilderItemComponent
  ],
  templateUrl: './query-detail.component.html',
  styleUrl: './query-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryDetailComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly dialogRef = inject(MatDialogRef<QueryDetailComponent>);
  public data = inject<QueryDetail>(MAT_DIALOG_DATA);


  @ViewChildren(QueryBuilderItemComponent) children!: QueryList<QueryBuilderItemComponent>;

  queryConfigs: QueryConfig[] = [];
  queryList: QueryItemDTO[] = [];
  queryDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  changed: boolean = false;

  ngOnInit(): void {
    this.queryConfigs = this.data.queryConfigs;
    if (this.data.queryData) {
      this.queryDetailForm.patchValue({
        name: this.data.queryData.name,
        description: this.data.queryData.description,
      });
      this.queryList = cloneDeep(this.data.queryData.query);
    }
    this.cdr.detectChanges();
  }

  isQueryRunning(): boolean {
    if (!this.data.queryData) {
      return false;
    }
    return !this.data.queryData.hasResult && this.data.queryData.hasFired;
  }


  onAddQueryItem(): void {
    this.queryList.push({
      ontologyId: '',
      operator: [],
    });

    this.handleQueryChange();
    this.cdr.detectChanges();
  }

  trackQueryItem(index: number) {
    return index;
  }

  removeQueryItem(indexNumber: number): void {
    this.queryList.splice(indexNumber, 1);
    this.handleQueryChange();
    this.cdr.detectChanges();
  }

  onRunQuery(): void {
    this.onSubmit(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(run?: boolean): void {
    if (this.isQueryDetailInvalid()) return;
    this.cdr.detectChanges();

    const name = this.queryDetailForm.get('name')!.value!;
    const description = this.queryDetailForm.get('description')!.value!;

    if (!this.changed && this.data.queryData && this.data.queryData.id) {
      const dto: QueryDTO = this.data.queryData;
      dto.description = description;
      dto.name = name;
      if(!dto.hasFired){
        dto.query = this.queryList;
      }

      this.queryService.updateQuery(dto).subscribe(query => {
        this.dialogRef.close(query);
      })
    } else {
      const dto: CreateQueryDTO = {
        name: name,
        description: description,
        query: this.queryList,
      }
      if (run) {
        this.queryService.createAndRunQuery(dto).subscribe(query => {
          this.dialogRef.close(query);
        })
      } else {
        this.queryService.createQuery(dto).subscribe(query => {
          this.dialogRef.close(query);
        })
      }
    }

  }

  isQueryDetailInvalid(): boolean {
    this.queryDetailForm.markAllAsTouched();
    return this.queryDetailForm.invalid;
  }

  getSubmitButtonLabel(): string {
    return `${this.data?.queryData ? 'Update' : 'Create'} query`;
  }

  handleQueryChange(): void {
    if (!this.data.queryData) {
      return;
    }
    if (!this.data.queryData.hasFired) {
      return;
    }
    this.changed = JSON.stringify(this.data.queryData.query) !== JSON.stringify(this.queryList);
    this.cdr.detectChanges();
  }
}
