import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAppBasedComponent } from './input-app-based.component';

describe('InputAppBasedComponent', () => {
  let component: InputAppBasedComponent;
  let fixture: ComponentFixture<InputAppBasedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAppBasedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputAppBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
