import {ChangeDetectionStrategy, Component, inject, model, output, signal} from '@angular/core';
import {QueryService} from "@global-app/find-data/services/query.service";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-select-query',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './select-query.component.html',
  styleUrl: './select-query.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectQueryComponent {
  private readonly queryService: QueryService = inject(QueryService);

  queryId = model<number | undefined>(undefined);
  queryIdSave = output();

  queryList = toSignal(this.queryService.getAllQueries());
  readonly editMode = signal(false);


  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode.set(true);
  }

  onSave(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode.set(false);
    this.queryIdSave.emit();
  }

}
