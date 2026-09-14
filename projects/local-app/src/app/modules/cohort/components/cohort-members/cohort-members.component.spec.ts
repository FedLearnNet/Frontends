import { ComponentFixture, TestBed } from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';

import { CohortMembersComponent } from './cohort-members.component';
import {CohortService} from '@local-app/cohort/services/cohort.service';

describe('CohortMembersComponent', () => {
  let component: CohortMembersComponent;
  let fixture: ComponentFixture<CohortMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CohortMembersComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: CohortService,
          useValue: {
            getAllUsers: () => of([]),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({afterClosed: () => of(false)}),
          },
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: () => undefined,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohortMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
