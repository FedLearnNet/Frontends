import {Component, Input} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {ModelDetailDto} from "@global-app/model-store/dto/model";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {ModelAccess} from "@global-app/model-store/dto/model-access";

@Component({
  selector: 'app-model-detail-access',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './model-detail-access.component.html',
  styleUrl: './model-detail-access.component.scss'
})
export class ModelDetailAccessComponent {

  @Input() model: ModelDetailDto;

  displayedColumns: string[] = ['name', 'access'];

  getAccessOptions(): string[] {
    return Object.values(ModelAccess);
  }
}
