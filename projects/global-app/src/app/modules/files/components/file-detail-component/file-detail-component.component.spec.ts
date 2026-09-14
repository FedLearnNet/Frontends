import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailComponentComponent } from './file-detail-component.component';

describe('FileDetailComponentComponent', () => {
  let component: FileDetailComponentComponent;
  let fixture: ComponentFixture<FileDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
