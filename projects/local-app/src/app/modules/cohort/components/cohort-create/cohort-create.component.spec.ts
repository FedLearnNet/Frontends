import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortCreateComponent } from './cohort-create.component';

describe('CohortCreateComponent', () => {
  let component: CohortCreateComponent;
  let fixture: ComponentFixture<CohortCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CohortCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
