import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a skeleton while the version loads', () => {
    fixture.componentRef.setInput('versionLoading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('lib-skeleton-line')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Version');
  });

  it('shows the version and its hint', () => {
    fixture.componentRef.setInput('version', '1.0.0');
    fixture.componentRef.setInput('versionHint', 'Platform runs 1.1.0');
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('.footer__version').textContent;
    expect(text).toContain('Version 1.0.0');
    expect(text).toContain('Platform runs 1.1.0');
    expect(fixture.nativeElement.querySelector('lib-skeleton-line')).toBeNull();
  });

  it('hides the version line without a version', () => {
    expect(fixture.nativeElement.querySelector('.footer__version')).toBeNull();
  });
});
