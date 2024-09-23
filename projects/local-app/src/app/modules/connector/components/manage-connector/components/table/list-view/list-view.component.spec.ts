import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewComponentDialogComponent } from './list-view.component';

describe('ListViewComponentDialog', () => {
  let component: ListViewComponentDialogComponent;
  let fixture: ComponentFixture<ListViewComponentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListViewComponentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListViewComponentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
