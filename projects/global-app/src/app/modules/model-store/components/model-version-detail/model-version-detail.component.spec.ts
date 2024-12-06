import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionDetailComponent } from './model-version-detail.component';

describe('ModelVersionDetailComponent', () => {
  let component: ModelVersionDetailComponent;
  let fixture: ComponentFixture<ModelVersionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
