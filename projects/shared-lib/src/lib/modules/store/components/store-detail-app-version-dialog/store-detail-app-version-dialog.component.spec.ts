import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetailAppVersionDialogComponent } from './store-detail-app-version-dialog.component';

describe('StoreDetailAppVersionDialogComponent', () => {
  let component: StoreDetailAppVersionDialogComponent;
  let fixture: ComponentFixture<StoreDetailAppVersionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetailAppVersionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDetailAppVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
