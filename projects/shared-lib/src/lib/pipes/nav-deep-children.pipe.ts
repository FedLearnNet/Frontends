import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'deepChildren', standalone: true })
export class DeepChildrenPipe implements PipeTransform {
  transform(value: any): Array<{ parent: string; items: any[] }> {
    if (!value || !Array.isArray(value)) return [];
    return value
      .filter((x: any) => Array.isArray(x?.children) && x.children.length)
      .map((x: any) => ({ parent: x.label, items: x.children }));
  }
}
