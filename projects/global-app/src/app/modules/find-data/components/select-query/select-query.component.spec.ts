import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectQueryComponent } from './select-query.component';

describe('SelectQueryComponent', () => {
  let component: SelectQueryComponent;
  let fixture: ComponentFixture<SelectQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
