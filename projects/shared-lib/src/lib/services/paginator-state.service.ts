import { Injectable } from '@angular/core';
import { PaginatorState } from '@shared-lib/models/paginator-state';

@Injectable({ providedIn: 'root' })
export class PaginatorStateService {
    private prefix = 'paginator:';

    get(key: string): PaginatorState {
        const raw = sessionStorage.getItem(this.prefix + key);
        return raw
            ? JSON.parse(raw)
            : { pageIndex: 0, pageSize: 10 };
    }

    set(key: string, value: PaginatorState): void {
        sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    clear(key: string): void {
        sessionStorage.removeItem(this.prefix + key);
    }
}
