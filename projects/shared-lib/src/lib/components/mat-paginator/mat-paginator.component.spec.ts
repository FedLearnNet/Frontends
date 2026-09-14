import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MatPaginatorComponent} from './mat-paginator.component';

describe('MatPaginatorComponent', () => {
  let fixture: ComponentFixture<MatPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatPaginatorComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MatPaginatorComponent);
    fixture.detectChanges();
  });

});
