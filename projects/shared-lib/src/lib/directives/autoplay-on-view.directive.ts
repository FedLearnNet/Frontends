import {Directive, ElementRef, OnDestroy, AfterViewInit, inject} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appAutoplayOnView]'
})
export class AutoplayOnViewDirective implements AfterViewInit, OnDestroy {
  private readonly el: ElementRef<HTMLVideoElement> = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video: HTMLVideoElement = this.el.nativeElement;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          video.play().catch(err => console.log(err));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if(this.observer){
      this.observer.disconnect();
    }
  }
}
