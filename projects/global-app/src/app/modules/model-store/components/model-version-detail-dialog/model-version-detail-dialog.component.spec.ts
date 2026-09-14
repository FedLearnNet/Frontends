import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionDetailDialogComponent } from './model-version-detail-dialog.component';

describe('ModelVersionDetailDialogComponent', () => {
  let component: ModelVersionDetailDialogComponent;
  let fixture: ComponentFixture<ModelVersionDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
