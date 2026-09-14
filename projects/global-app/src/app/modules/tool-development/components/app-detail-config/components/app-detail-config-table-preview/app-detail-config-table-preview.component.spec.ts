import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigTablePreviewComponent } from './app-detail-config-table-preview.component';

describe('AppDetailConfigTablePreviewComponent', () => {
  let component: AppDetailConfigTablePreviewComponent;
  let fixture: ComponentFixture<AppDetailConfigTablePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigTablePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigTablePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
