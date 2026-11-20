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

  it('formats opaque PATH file ids without throwing', () => {
    expect(component.formatInputDataValue(42)).toBe('File #42');
    expect(component.formatInputDataValue('99')).toBe('File #99');
    expect(component.formatInputDataValue('/data/ffq_archive.xlsx')).toBe('ffq_archive.xlsx');
    expect(component.formatInputDataValue(undefined)).toBe('—');
  });
});
