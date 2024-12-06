import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {QueryService} from "@global-app/find-data/services/query.service";
import {QueryDTO} from "@global-app/find-data/dto/query";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-select-query',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './select-query.component.html',
  styleUrl: './select-query.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectQueryComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly queryService: QueryService = inject(QueryService);

  @Input() queryId?: number;
  @Output() queryIdChange: EventEmitter<number> = new EventEmitter<number>();
  queryList: QueryDTO[] = [];
  editMode: boolean = false;


  ngOnInit(): void {
    this.queryService.getAllQueries().subscribe((queryList) => {
      this.queryList = queryList;
      this.cdr.detectChanges();
    });
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode = true;
  }

  onSave(event: MouseEvent): void {
    event.stopPropagation();
    this.editMode = false;
    this.queryIdChange.emit(this.queryId);
  }

}
