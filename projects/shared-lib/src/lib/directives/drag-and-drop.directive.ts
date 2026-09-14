import {
  Directive,
  HostListener,
  output
} from '@angular/core';

@Directive({
    selector: '[appDragAndDrop]',
    standalone: true
})
export class DragAndDropDirective {
    readonly fileDropped = output<any>();

    @HostListener('drop', ['$event']) public ondrop(event: any) {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.fileDropped.emit(files);
        }
    }
}
