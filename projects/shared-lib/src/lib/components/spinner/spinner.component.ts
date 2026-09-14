import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  Renderer2
} from '@angular/core';
import {SpinnerService} from '@shared-lib/services/spinner.service';
import {AsyncPipe} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-lib-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  imports: [
    AsyncPipe,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent implements AfterViewInit, OnDestroy {
  private readonly el: ElementRef = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly spinnerService: SpinnerService = inject(SpinnerService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  isLoading$ = this.spinnerService.loadingObservable$;

  private resizeObserver: ResizeObserver;

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateHeight();
    });

    this.resizeObserver.observe(this.el.nativeElement.parentElement);
    this.updateHeight();
    this.cdr.detectChanges();
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
