import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileProfileCardComponent } from './file-profile-card.component';

describe('FileProfileCardComponent', () => {
  let _component: FileProfileCardComponent;
  let fixture: ComponentFixture<FileProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileProfileCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileProfileCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});
