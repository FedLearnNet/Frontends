import {AfterViewInit, Component, ElementRef, inject, ViewChild} from '@angular/core';
import {UMLSService} from "@global-app/schema/services/umls";
import {UMLSDetailResultDTO, UMLSSearchResultDTO, UMLSSearchResultDtoPage} from "../../dto/umls";
import {MatPaginator} from "@angular/material/paginator";
import {catchError, fromEvent, map, merge, Observable, of, pipe, switchMap} from "rxjs";
import {filter, startWith} from "rxjs/operators";
import {MatInput} from "@angular/material/input";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatDialog} from "@angular/material/dialog";
import {UmlsParentGraphComponent} from "../umls-parent-graph/umls-parent-graph.component";

@Component({
  selector: 'app-list-umls',
  templateUrl: './list-umls.component.html',
  styleUrl: './list-umls.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListUMLSComponent implements AfterViewInit {
  readonly uMLSService: UMLSService = inject(UMLSService)
  readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['ui', 'name', 'rootSource', 'expand'];

  data: UMLSSearchResultDTO[] = [];
  expandedElement: UMLSSearchResultDTO | null;
  expandedDetail: UMLSDetailResultDTO | null;
  resultsLength = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('search', {static: false}) search: ElementRef;

  ngAfterViewInit(): void {
    merge(fromEvent(this.search.nativeElement, 'change'), this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.uMLSService.search(
            this.search.nativeElement.value,
            this.paginator.pageIndex + 1,
            30).pipe(catchError(() => of(null)));
        }),
        filter((data: UMLSSearchResultDtoPage | null): data is UMLSSearchResultDtoPage => data !== null),
        map((data: UMLSSearchResultDtoPage) => {
          const results = data.results;
          this.resultsLength = data.total;
          return results;
        }),
      )
      .subscribe(data => (this.data = data));
  }

  openDialog(data: UMLSSearchResultDTO): void {
    const dialogRef = this.dialog.open(UmlsParentGraphComponent, {
      data: data,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openDetails(element: UMLSSearchResultDTO): void {
    this.expandedElement = this.expandedElement === element ? null : element;
    if (this.expandedElement) {
      this.loadDetails(element);
    } else {
      this.expandedDetail = null;
    }
  }

  loadDetails(row: UMLSSearchResultDTO) {
    this.uMLSService.getUmlsDetails(row.ui).subscribe(
      (data: UMLSDetailResultDTO) => {
        this.expandedDetail = data;
      }
    )
  }
}
