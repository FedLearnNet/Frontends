import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QueryService } from '@global-app/find-data/services/query.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Query } from '@global-app/find-data/models';
import { isNotEmpty } from '@shared-lib/utils';

@Component({
  selector: 'app-query-detail',
  templateUrl: './query-detail.component.html',
  styleUrl: './query-detail.component.scss',
})
export class QueryDetailComponent {
  isQueryExecuted: boolean = false;
  queryResult: {
    datasets: number,
    holders: number,
  };
  queryList: any[] = [];

  queryDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  constructor(
      public dialogRef: MatDialogRef<QueryDetailComponent>,

      @Inject(MAT_DIALOG_DATA) public data: any,

      private formBuilder: FormBuilder,
      private queryService: QueryService,
  ) { }

  ngOnInit(): void {
    this.loadQueryDetail();
  }

  loadQueryDetail(): void {
    if (!this.data?.queryData) return;

    const queryData = this.data.queryData;

    this.queryDetailForm.patchValue({...queryData} as Query);

    // Add a dummy query item row
    this.onAddQueryItem();

    if (isNotEmpty(queryData.result)) {
      this.isQueryExecuted = true;
      this.queryResult = queryData.result;
    }
  }

  onAddQueryItem(): void {
    this.queryList.push({
      id: this.queryList.length + 1,
      column: '',
    });

    this.handleQueryListChange();
  }

  removeQueryItem(itemId: number): void {
    this.queryList = this.queryList.filter(queryItem => queryItem.id !== itemId);

    this.handleQueryListChange();
  }

  handleQueryListChange(): void {
    this.isQueryExecuted = false;
  }

  onRunQuery(): void {
    this.isQueryExecuted = true;

    this.queryService.runSpecificQuery(/* query data */).subscribe(result => {
      this.queryResult = result;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isQueryDetailInvalid()) return;

    this.dialogRef.close({
      ...this.data?.queryData,
      ...this.queryDetailForm.getRawValue(),
      result: this.isQueryExecuted ? this.queryResult : null,
    });
  }

  isQueryDetailInvalid(): boolean {
    this.queryDetailForm.markAllAsTouched();

    return this.queryDetailForm.invalid;
  }

  getSubmitButtonLabel(): string {
    return `${this.data?.queryData ? 'Update' : 'Create'} query`;
  }

  getResultLabel(): string {
    if (!this.queryResult.holders) return '';

    return `${ this.queryResult.datasets } datasets from ${ this.queryResult.holders } data holders`;
  }
}
