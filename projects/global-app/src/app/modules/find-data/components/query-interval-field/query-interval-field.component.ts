import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {IntervalPart, IntervalUnit} from '@global-app/find-data/models/query-tree';

@Component({
  selector: 'app-query-interval-field',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './query-interval-field.component.html',
  styleUrl: './query-interval-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryIntervalFieldComponent {
  readonly parts = input<IntervalPart[]>([]);
  readonly partsChange = output<IntervalPart[]>();

  readonly units: IntervalUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months', 'years'];

  add(): void {
    this.partsChange.emit([...this.parts(), {count: 1, unit: 'days'}]);
  }

  remove(index: number): void {
    this.partsChange.emit(this.parts().filter((_, partIndex) => partIndex !== index));
  }

  updateCount(index: number, value: string): void {
    const count = value === '' ? null : Number(value);
    this.replace(index, {count: Number.isFinite(count) ? count : null});
  }

  updateUnit(index: number, unit: IntervalUnit): void {
    this.replace(index, {unit});
  }

  private replace(index: number, patch: Partial<IntervalPart>): void {
    const parts = this.parts().map((part, partIndex) => partIndex === index ? {...part, ...patch} : part);
    this.partsChange.emit(parts);
  }
}
