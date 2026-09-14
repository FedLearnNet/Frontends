import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseableDialogTitleComponent } from './closeable-dialog-title.component';

describe('CloseableDialogTitleComponent', () => {
  let component: CloseableDialogTitleComponent;
  let fixture: ComponentFixture<CloseableDialogTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseableDialogTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseableDialogTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
