import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  setItem(key: string, value: any): void {
    if (isUndefined(value)) {
      this.removeItem(key);
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    const item = localStorage.getItem(key);

    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  hasKeyValue(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  clear(): void {
    localStorage.clear();
  }
}
