import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LocalStorageService } from '@shared-lib/services/local-storage.service';

@Component({
    selector: 'app-lib-mat-paginator',
    templateUrl: './mat-paginator.component.html',
    styleUrl: './mat-paginator.component.scss'
})
export class MatPaginatorComponent implements OnInit {
    @Input() tableName: string;
    @Input() length: number = 0;
    @Input() pageSize: number = 50;
    @Input() pageIndex: number = 0;
    @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

    @Output() page = new EventEmitter<any>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    get localStorageKey(): string {
        return `${ this.tableName }-page-size`;
    }

    constructor(
        private localStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        this.loadPaginatorSettings();
    }

    onPageEvent(event: any): void {
        this.pageSize =  event.pageSize;
        this.pageIndex =  event.pageIndex;
        this.localStorageService.setItem(this.localStorageKey, event.pageSize);
        this.page.emit(event);
    }

    private loadPaginatorSettings(): void {
        const pageSize = this.localStorageService.getItem(this.localStorageKey);
        if (pageSize) {
            this.pageSize = pageSize;
        }
    }
}
