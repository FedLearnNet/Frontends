import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytes',
  standalone: true
})
export class BytesPipe implements PipeTransform {
  transform(value?: number | null, decimals: number = 1): string {
    if (value == null || isNaN(value)) return '—';
    if (value === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
