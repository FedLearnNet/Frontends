import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DragAndDropFileComponent} from './drag-and-drop-file.component';

describe('DragAndDropFileComponent', () => {
  let fixture: ComponentFixture<DragAndDropFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragAndDropFileComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DragAndDropFileComponent);
    fixture.detectChanges();
  });

});
