import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {ModelDetailDto, ModelVersionDto} from "@global-app/model-store/dto/model";
import {CommonModule} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {
  ModelVersionDetailComponent
} from "@global-app/model-store/components/model-version-detail/model-version-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";

@Component({
  selector: 'app-model-version-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIcon, MatMenuModule],
  templateUrl: './model-version-list.component.html',
  styleUrl: './model-version-list.component.scss'
})
export class ModelVersionListComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);

  @Input() model: ModelDetailDto;
  @Output() selectedVersion: EventEmitter<ModelVersionDto> = new EventEmitter<ModelVersionDto>();

  displayedColumns: string[] = ['version', 'createdAt', 'hasModelSelected', 'changelog', 'actions'];

  ngOnInit(): void {
    if (this.model.createdByUser) {
      this.displayedColumns = ['version', 'createdAt', 'publishStatus', 'hasModelSelected', 'changelog', 'actions'];
    }
  }

  useSpecificVersion(version: ModelVersionDto) {
    this.selectedVersion.emit(version);
  }

  isSelectedVersion(version: ModelVersionDto): boolean {
    return (!!this.model.lastVersion) && version.id === this.model.lastVersion.id;
  }

  openVersion(version: ModelVersionDto): void {
    const dialogRef = this.dialog.open(ModelVersionDetailComponent, {
      data: {model: this.model, version: version},
      width: '900px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.model.modelVersions) {
        this.model.modelVersions = this.model.modelVersions.map(v => v.id === result.id ? result : v);
      }
    });
  }


}
