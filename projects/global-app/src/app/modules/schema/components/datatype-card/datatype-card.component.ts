import {Component, inject, Input} from '@angular/core';
import {DataTypeDTO} from "../../dto/datatype";
import {MatDialog} from "@angular/material/dialog";
import {DetailDatatypeComponent} from "../detail-datatype/detail-datatype.component";

@Component({
  selector: 'app-datatype-card',
  templateUrl: './datatype-card.component.html',
  styleUrl: './datatype-card.component.scss'
})
export class DatatypeCardComponent {
  @Input() dataType?: DataTypeDTO;
  @Input() ontologyId?: string;
  @Input() showAddBtn: boolean = false;

  readonly dialog = inject(MatDialog);

  openUpdateDialog(): void {
    let dataType = this.dataType;
    if (!dataType) {
      dataType = {name: '', desc: '', type: '', validations: [], allowedValues: [], ontologyId: this.ontologyId};
    }
    const dialogRef = this.dialog.open(DetailDatatypeComponent, {
      data: dataType,
    });

    dialogRef.afterClosed().subscribe((result?: DataTypeDTO) => {
      if (result !== undefined) {
        this.dataType = result;
      }
    });
  }

}
