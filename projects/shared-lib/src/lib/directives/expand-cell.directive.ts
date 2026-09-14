import {
  Directive,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  HostListener, inject
} from '@angular/core';

@Directive({
  selector: 'td[libExpandableCell], th[libExpandableCell]'
})
export class ExpandCellDirective implements AfterViewInit, OnDestroy {
  private el: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private r: Renderer2 = inject(Renderer2);

  private expanded = false;
  private truncated = false;

  private resizeObs?: ResizeObserver;
  private mutationObs?: MutationObserver;

  ngAfterViewInit(): void {
    this.initObservers();
    this.recompute(); // initial state
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
    this.mutationObs?.disconnect();
  }


  private initObservers(): void {
    const node = this.el.nativeElement;

    this.resizeObs = new ResizeObserver(() => this.recompute());
    this.resizeObs.observe(node);

    this.mutationObs = new MutationObserver(() => this.recompute());
    this.mutationObs.observe(node, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  private recompute(): void {
    const node = this.el.nativeElement;

    if (this.expanded) {
      // Showing full content -> treat as not truncated for cursor / ARIA.
      this.setTruncated(false);
      return;
    }

    const style = getComputedStyle(node);
    const eligible =
      style.whiteSpace === 'nowrap' &&
      style.overflow === 'hidden';

    const isTruncated = eligible && node.scrollWidth > node.clientWidth;
    this.setTruncated(isTruncated);
  }

  private setTruncated(val: boolean): void {
    if (this.truncated === val) return;
    this.truncated = val;

    // Accessibility: only make it focusable / button-like when actually truncated
    const node = this.el.nativeElement;
    if (this.truncated) {
      this.r.setAttribute(node, 'role', 'button');
      this.r.setAttribute(node, 'tabindex', '0');
      this.r.setAttribute(node, 'aria-expanded', 'false');
    } else {
      node.removeAttribute('role');
      node.removeAttribute('tabindex');
      node.removeAttribute('aria-expanded');
    }

    this.updateCursor();
  }

  private updateCursor(): void {
    const node = this.el.nativeElement;
    if (this.expanded) {
      this.r.setStyle(node, 'cursor', 'zoom-out');
    } else {
      this.r.setStyle(node, 'cursor', this.truncated ? 'pointer' : 'default');
    }
  }


  @HostListener('click')
  toggle(): void {
    if (!this.truncated && !this.expanded) {
      // No truncation; do nothing
      return;
    }

    this.expanded = !this.expanded;
    this.el.nativeElement.classList.toggle('td-expanded', this.expanded);
    this.r.setAttribute(this.el.nativeElement, 'aria-expanded', String(this.expanded));

    this.updateCursor();

    // After DOM changes, recompute (e.g., collapsing may reintroduce truncation)
    queueMicrotask(() => this.recompute());
  }

  @HostListener('keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      if (!this.truncated && !this.expanded) return;
      ev.preventDefault();
      this.toggle();
    } else if (ev.key === 'Escape' && this.expanded) {
      this.expanded = false;
      this.el.nativeElement.classList.remove('td-expanded');
      this.r.setAttribute(this.el.nativeElement, 'aria-expanded', 'false');
      this.updateCursor();
      queueMicrotask(() => this.recompute());
    }
  }
}
