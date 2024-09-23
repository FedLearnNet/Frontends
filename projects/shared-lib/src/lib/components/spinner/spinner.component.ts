import { Component, ElementRef, Renderer2, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { SpinnerService } from '@shared-lib/services/spinner.service';

@Component({
  selector: 'app-lib-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent implements OnInit, AfterViewInit, OnDestroy {
  showLoadingSpinner: boolean = false;
  isLoading$ = this.spinnerService.loadingObservable$;

  private resizeObserver: ResizeObserver;

  constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      private ref: ChangeDetectorRef,
      private spinnerService: SpinnerService,
  ) { }

  ngOnInit(): void {
    this.isLoading$.subscribe(isLoading => {
      this.showLoadingSpinner = isLoading
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateHeight();
    });

    this.resizeObserver.observe(this.el.nativeElement.parentElement);
    this.updateHeight();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateHeight(): void {
    const loadingContainer = document.getElementsByClassName('loading-container')[0];

    if (loadingContainer) {
      this.renderer.setStyle(loadingContainer, 'height', `${document.body.scrollHeight}px`);
    }
  }
}
