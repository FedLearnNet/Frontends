import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetPreviewCardComponent } from './dataset-preview-card.component';

describe('DatasetPreviewCardComponent', () => {
  let component: DatasetPreviewCardComponent;
  let fixture: ComponentFixture<DatasetPreviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetPreviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetPreviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
