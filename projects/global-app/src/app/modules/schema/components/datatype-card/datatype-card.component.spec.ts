import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatypeCardComponent } from './datatype-card.component';

describe('DatatypeCardComponent', () => {
  let component: DatatypeCardComponent;
  let fixture: ComponentFixture<DatatypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatypeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatatypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
