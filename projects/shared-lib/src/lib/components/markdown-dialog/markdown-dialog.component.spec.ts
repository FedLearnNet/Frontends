import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownDialogComponent } from './markdown-dialog.component';

describe('MarkdownDialogComponent', () => {
  let component: MarkdownDialogComponent;
  let fixture: ComponentFixture<MarkdownDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkdownDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
