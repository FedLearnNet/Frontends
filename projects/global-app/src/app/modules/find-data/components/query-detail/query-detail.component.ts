import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {QueryService} from '@global-app/find-data/services/query.service';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {QueryConfig} from '@global-app/find-data/models';
import {
  QueryBuilderItemComponent
} from '@global-app/find-data/components/query-builder-item/query-builder-item.component';
import {CreateQueryDTO, QueryDTO, QueryItemDTO} from "@global-app/find-data/dto/query";

import {MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {cloneDeep} from "lodash";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";


interface QueryDetail {
  queryConfigs: QueryConfig[];
  queryData?: QueryDTO;
}

@Component({
  selector: 'app-query-detail',
  imports: [
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
    QueryBuilderItemComponent,
    TranslatePipe,
    CloseableDialogTitleComponent,
    BtnComponent
  ],
  templateUrl: './query-detail.component.html',
  styleUrl: './query-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryDetailComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly dialogRef = inject(MatDialogRef<QueryDetailComponent>);
  public data = inject<QueryDetail>(MAT_DIALOG_DATA);
  private readonly translate: TranslateService = inject(TranslateService);


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
      dataTypeId: '',
      operator: [],
    });

    this.handleQueryChange();
    this.cdr.detectChanges();
  }

  removeQueryItem(indexNumber: number): void {
    this.queryList.splice(indexNumber, 1);
    this.handleQueryChange();
    this.cdr.detectChanges();
  }

  onRunQuery(): void {
    this.onSubmit(true);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('92vw', '88vh');
    }
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
      if (!dto.hasFired) {
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
        groupId: this.data.queryData?.groupId,
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
    return this.data?.queryData
      ? this.translate.instant('BUTTON.UPDATE_NAME', {name: this.translate.instant('GRID.QUERY').toLowerCase()})
      : this.translate.instant('BUTTON.CREATE_NAME', {name: this.translate.instant('GRID.QUERY').toLowerCase()});
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
