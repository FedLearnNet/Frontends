import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListComponentComponent } from './file-list-component.component';

describe('FileListComponentComponent', () => {
  let component: FileListComponentComponent;
  let fixture: ComponentFixture<FileListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
