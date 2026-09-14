import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigTableElementDialogComponent } from './app-detail-config-table-element-dialog.component';

describe('AppDetailConfigTableElementDialogComponent', () => {
  let _component: AppDetailConfigTableElementDialogComponent;
  let fixture: ComponentFixture<AppDetailConfigTableElementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigTableElementDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigTableElementDialogComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
   // expect(component).toBeTruthy();
  });
});
