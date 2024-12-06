import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDetailAccessComponent } from './model-detail-access.component';

describe('ModelDetailAccessComponent', () => {
  let component: ModelDetailAccessComponent;
  let fixture: ComponentFixture<ModelDetailAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelDetailAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelDetailAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
