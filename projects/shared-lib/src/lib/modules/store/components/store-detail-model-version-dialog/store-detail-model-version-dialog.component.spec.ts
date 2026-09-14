import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetailModelVersionDialogComponent } from './store-detail-model-version-dialog.component';

describe('StoreDetailModelVersionDialogComponent', () => {
  let component: StoreDetailModelVersionDialogComponent;
  let fixture: ComponentFixture<StoreDetailModelVersionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetailModelVersionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDetailModelVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
