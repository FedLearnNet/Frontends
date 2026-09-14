import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailCardComponent } from './file-detail-card.component';

describe('FileDetailCardComponent', () => {
  let _component: FileDetailCardComponent;
  let fixture: ComponentFixture<FileDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDetailCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDetailCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
