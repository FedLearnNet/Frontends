import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CohortListItem } from '../models/cohort-list-item';

@Injectable({
  providedIn: 'root'
})
export class SharedCohortService {
    getCohortList(): Observable<CohortListItem[]> {
        return of([]);
    }
}
