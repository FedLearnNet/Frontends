import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SkeletonLineComponent} from './skeleton-line.component';

describe('SkeletonLineComponent', () => {
  let fixture: ComponentFixture<SkeletonLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonLineComponent);
  });

  it('applies the given size', () => {
    fixture.componentRef.setInput('width', '8ch');
    fixture.componentRef.setInput('height', '12px');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.width).toBe('8ch');
    expect(host.style.height).toBe('12px');
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
