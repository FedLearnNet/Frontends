import {
    Directive,
    Output,
    EventEmitter,
    HostListener
} from '@angular/core';

@Directive({
    selector: '[drag-and-drop]'
})
export class DragAndDropDirective {
    @Output() fileDropped = new EventEmitter<any>();

    @HostListener('drop', ['$event']) public ondrop(event: any) {
        event.preventDefault();
        event.stopPropagation();

        let files = event.dataTransfer.files;
        if (files.length > 0) {
            this.fileDropped.emit(files);
        }
    }
}
