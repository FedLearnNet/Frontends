import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelResultCardComponent } from './model-result-card.component';

describe('ModelResultCardComponent', () => {
  let component: ModelResultCardComponent;
  let fixture: ComponentFixture<ModelResultCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelResultCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelResultCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
