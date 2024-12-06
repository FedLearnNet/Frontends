import {Component, inject, Input, OnInit} from '@angular/core';
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {EMPTY, Observable} from "rxjs";
import {DataTypeDTO} from "../../dto/datatype";

@Component({
  selector: 'app-list-datatypes',
  templateUrl: './list-datatypes.component.html',
  styleUrl: './list-datatypes.component.scss'
})
export class ListDatatypesComponent implements OnInit {
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  @Input() ontologyId: string;

  datatypes$: Observable<DataTypeDTO[]> = EMPTY;

  ngOnInit(): void {
    this.datatypes$ = this.dataTypeService.getAll(this.ontologyId);
  }


}
