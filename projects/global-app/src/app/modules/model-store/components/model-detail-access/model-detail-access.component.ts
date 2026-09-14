import {Component, input} from '@angular/core';
import {MatTableModule} from "@angular/material/table";

import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {ModelAccess} from "@global-app/model-store/dto/model-access";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-model-detail-access',
    imports: [
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe
],
    templateUrl: './model-detail-access.component.html',
    styleUrl: './model-detail-access.component.scss'
})
export class ModelDetailAccessComponent {
  readonly model = input<ModelDetailDto>({} as ModelDetailDto);

  displayedColumns: string[] = ['name', 'access'];

  getAccessOptions(): string[] {
    return Object.values(ModelAccess);
  }
}
