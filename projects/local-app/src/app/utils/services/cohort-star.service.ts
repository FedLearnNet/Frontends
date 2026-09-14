import {Injectable, signal} from '@angular/core';

const STORAGE_KEY = 'local-app.starred-cohorts';

@Injectable({providedIn: 'root'})
export class CohortStarService {
  private readonly _starredIds = signal<string[]>(this.read());

  readonly starredIds = this._starredIds.asReadonly();

  isStarred(id: string): boolean {
    return this._starredIds().includes(id);
  }

  toggle(id: string): void {
    const current = this._starredIds();
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    this._starredIds.set(next);
    this.write(next);
  }

  private read(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  private write(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore quota / unavailable storage
    }
  }
}
