import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileAreaComponent } from './upload-file-area.component';

describe('UploadFileAreaComponent', () => {
  let component: UploadFileAreaComponent;
  let fixture: ComponentFixture<UploadFileAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFileAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFileAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
