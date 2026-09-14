import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {LocalQueryDto} from "../../../logs/dto/query";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {QueryDetailCardComponent} from "@shared-lib/modules/query/query-detail-card/query-detail-card.component";

@Component({
  selector: 'app-patient-query-log-detail',
  imports: [
    MatButtonModule,
    MatDialogContent,
    TranslatePipe,
    CloseableDialogTitleComponent,
    QueryDetailCardComponent,
  ],
  templateUrl: './query-log-detail-dialog.component.html',
  styleUrl: './query-log-detail-dialog.component.scss'
})
export class QueryLogDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<QueryLogDetailDialogComponent>);
  readonly data = inject<LocalQueryDto>(MAT_DIALOG_DATA);
}
