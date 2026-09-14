import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreGraphShortestPathDialogComponent } from './store-graph-shortest-path-dialog.component';

describe('StoreGraphShortestPathDialogComponent', () => {
  let component: StoreGraphShortestPathDialogComponent;
  let fixture: ComponentFixture<StoreGraphShortestPathDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreGraphShortestPathDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreGraphShortestPathDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
