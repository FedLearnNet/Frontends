import {Component, effect, input, signal, viewChild} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {RunMessageLogDTO} from '@shared-lib/modules/experiments/dto/log';
import {DatePipe} from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {TranslatePipe} from '@ngx-translate/core';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-app-log-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    DatePipe,
    MatPaginatorModule,
    TranslatePipe,
    FormsModule,
  ],
  templateUrl: './app-log-table.component.html',
  styleUrl: './app-log-table.component.scss',
})
export class AppLogTableComponent {
  logs = input<RunMessageLogDTO[]>([]);
  paginator = viewChild(MatPaginator);
  filterValue = signal<string>('');

  displayedColumns: string[] = ['severity', 'timestamp', 'summary'];
  dataSource = new MatTableDataSource<RunMessageLogDTO>([]);

  private syncDataEffect = effect(() => {
    this.dataSource.data = this.logs();
  });

  private attachPaginatorEffect = effect(() => {
    const p = this.paginator();
    if (p) {
      this.dataSource.paginator = p;
    }
  });

  private filterEffect = effect(() => {
    this.dataSource.filter = this.filterValue().trim().toLowerCase();
  });

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.filterValue.set(value);
  }

  valueNonNull(value: any) {
    return !(value == null || value === 'null');
  }
}
