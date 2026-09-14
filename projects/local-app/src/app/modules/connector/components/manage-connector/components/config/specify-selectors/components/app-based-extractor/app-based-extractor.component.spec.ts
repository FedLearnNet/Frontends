import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBasedExtractorComponent } from './app-based-extractor.component';

describe('AppBasedExtractorComponent', () => {
  let component: AppBasedExtractorComponent;
  let fixture: ComponentFixture<AppBasedExtractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBasedExtractorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBasedExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
