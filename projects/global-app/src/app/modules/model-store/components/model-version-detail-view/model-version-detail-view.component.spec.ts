import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionDetailViewComponent } from './model-version-detail-view.component';

describe('ModelVersionDetailViewComponent', () => {
  let component: ModelVersionDetailViewComponent;
  let fixture: ComponentFixture<ModelVersionDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionDetailViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
