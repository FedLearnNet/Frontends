import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreSelectDialogComponent } from './store-select-dialog.component';

describe('StoreSelectDialogComponent', () => {
  let component: StoreSelectDialogComponent;
  let fixture: ComponentFixture<StoreSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreSelectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
