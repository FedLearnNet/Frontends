import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawLogViewerComponent } from './raw-log-viewer.component';

describe('RawLogViewerComponent', () => {
  let component: RawLogViewerComponent;
  let fixture: ComponentFixture<RawLogViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawLogViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RawLogViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
