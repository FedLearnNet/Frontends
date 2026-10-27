import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {QueryJsonPreviewComponent} from '@global-app/find-data/components/query-json-preview/query-json-preview.component';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {QueryService} from '@global-app/find-data/services/query.service';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {QueryConfig} from '@global-app/find-data/models';
import {
  QueryBuilderGroupComponent
} from '@global-app/find-data/components/query-builder-group/query-builder-group.component';
import {QueryDTO} from "@global-app/find-data/dto/query";
import {createEmptyGroup, QueryGroupNode} from '@global-app/find-data/models/query-tree';
import {hydrateQueryTree, serializeQueryTree} from '@global-app/find-data/helpers/query-tree.serializer';
import {isQueryTreeValid} from '@global-app/find-data/helpers/query-tree.validator';

import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
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
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    QueryBuilderGroupComponent,
    QueryJsonPreviewComponent,
    MatButtonModule,
    MatIconModule,
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

  queryConfigs: QueryConfig[] = [];
  queryRoot: QueryGroupNode = createEmptyGroup();
  queryDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  changed: boolean = false;
  readonly showJson = signal(false);

  requestPreview(): unknown {
    return {
      name: this.queryDetailForm.get('name')!.value ?? '',
      description: this.queryDetailForm.get('description')!.value ?? '',
      query: serializeQueryTree(this.queryRoot),
    };
  }

  ngOnInit(): void {
    this.queryConfigs = this.data.queryConfigs ?? [];
    if (this.data.queryData) {
      this.queryDetailForm.patchValue({
        name: this.data.queryData.name,
        description: this.data.queryData.description,
      });
      this.queryRoot = hydrateQueryTree(this.data.queryData.query, this.queryConfigs);
    }
    this.cdr.detectChanges();
  }

  isQueryRunning(): boolean {
    if (!this.data.queryData) {
      return false;
    }
    return !this.data.queryData.hasResult && this.data.queryData.hasFired;
  }

  onQueryChange(group: QueryGroupNode): void {
    this.queryRoot = group;
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
    const query = serializeQueryTree(this.queryRoot);

    if (!this.changed && this.data.queryData && this.data.queryData.id) {
      const dto = this.data.queryData;
      this.queryService.updateQuery({
        id: dto.id,
        name,
        description,
        query: dto.hasFired ? dto.query : query,
      }).subscribe(updated => {
        this.dialogRef.close(updated);
      });
    } else {
      const dto = {
        name,
        description,
        query,
        groupId: this.data.queryData?.groupId,
      };
      if (run) {
        this.queryService.createAndRunQuery(dto).subscribe(created => {
          this.dialogRef.close(created);
        });
      } else {
        this.queryService.createQuery(dto).subscribe(created => {
          this.dialogRef.close(created);
        });
      }
    }
  }

  get treeValid(): boolean {
    return isQueryTreeValid(this.queryRoot);
  }

  isQueryDetailInvalid(): boolean {
    this.queryDetailForm.markAllAsTouched();
    return this.queryDetailForm.invalid || !isQueryTreeValid(this.queryRoot);
  }

  getSubmitButtonLabel(): string {
    return this.data?.queryData
      ? this.translate.instant('BUTTON.UPDATE_NAME', {name: this.translate.instant('GRID.QUERY').toLowerCase()})
      : this.translate.instant('BUTTON.CREATE_NAME', {name: this.translate.instant('GRID.QUERY').toLowerCase()});
  }

  handleQueryChange(): void {
    if (!this.data.queryData?.hasFired) {
      return;
    }
    const current = serializeQueryTree(hydrateQueryTree(this.data.queryData.query, this.queryConfigs));
    const next = serializeQueryTree(this.queryRoot);
    this.changed = JSON.stringify(current) !== JSON.stringify(next);
    this.cdr.detectChanges();
  }
}
